import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const CANCEL_MODES = ["at_period_end", "immediate_refund"] as const;
export type CancelMode = (typeof CANCEL_MODES)[number];

export function isCancelMode(value: unknown): value is CancelMode {
  return typeof value === "string" && (CANCEL_MODES as readonly string[]).includes(value);
}

export type CancelMembershipSuccess = {
  mode: CancelMode;
  memberName: string | null;
  /** Date the membership stops, when cancelling at period end (YYYY-MM-DD). */
  endsOn: string | null;
  /** Dollars refunded, when refunding immediately. */
  refundAmount: number | null;
  refundId: string | null;
  /**
   * Set when the subscription was cancelled but the refund did not go through.
   * The caller must show this — the money has NOT moved.
   */
  warning: string | null;
};

export type CancelMembershipOutcome =
  | { ok: true; result: CancelMembershipSuccess }
  | { ok: false; error: string; status: number };

function unixToDate(seconds: number | null | undefined): string | null {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Find something refundable for this membership. Subscriptions store the
 * subscription id in `payments.stripe_transaction_id`, not a charge, so the
 * refund target has to come from the subscription's latest invoice.
 */
async function findRefundTarget(
  stripe: Stripe,
  subscriptionId: string | null,
  fallbackTransactionId: string | null,
): Promise<{ payment_intent?: string; charge?: string } | null> {
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const invoiceId =
      typeof subscription.latest_invoice === "string"
        ? subscription.latest_invoice
        : (subscription.latest_invoice?.id ?? null);

    if (invoiceId) {
      const invoice = await stripe.invoices.retrieve(invoiceId, { expand: ["payments"] });
      for (const entry of invoice.payments?.data ?? []) {
        if (entry.status !== "paid") continue;
        const intent = entry.payment.payment_intent;
        if (intent) return { payment_intent: typeof intent === "string" ? intent : intent.id };
        const charge = entry.payment.charge;
        if (charge) return { charge: typeof charge === "string" ? charge : charge.id };
      }
    }
  }

  // One-time memberships store the payment intent directly.
  if (fallbackTransactionId?.startsWith("pi_")) {
    return { payment_intent: fallbackTransactionId };
  }
  return null;
}

/** Most recent payment row for this membership — the one a refund applies to. */
async function latestPayment(supabase: SupabaseClient, membershipId: string) {
  const { data } = await supabase
    .from("payments")
    .select("id, amount, stripe_transaction_id")
    .eq("membership_id", membershipId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as { id: string; amount: number; stripe_transaction_id: string | null } | null;
}

/**
 * Cancel a membership for real — in Stripe, not just as a status label.
 *
 * `at_period_end` is the ordinary case: Stripe stops renewing, the member keeps
 * what they paid for until the period closes, and the row stays Active until
 * then. `immediate_refund` ends it now and returns the full last payment.
 */
export async function cancelMembership(
  membershipId: string,
  mode: CancelMode,
): Promise<CancelMembershipOutcome> {
  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase service role is not configured.", status: 503 };
  }

  const { data: membership, error: loadError } = await supabase
    .from("memberships")
    .select("id, status, is_subscription, stripe_subscription_id, current_period_end")
    .eq("id", membershipId)
    .maybeSingle();

  if (loadError) return { ok: false, error: loadError.message, status: 500 };
  if (!membership) return { ok: false, error: "Membership not found.", status: 404 };

  const { data: person } = await supabase
    .from("people")
    .select("full_name")
    .eq("membership_id", membershipId)
    .maybeSingle();
  const memberName = (person?.full_name as string | undefined) ?? null;

  if (membership.status === "Cancelled") {
    return { ok: false, error: "This membership is already cancelled.", status: 409 };
  }

  const subscriptionId: string | null = membership.is_subscription
    ? (membership.stripe_subscription_id ?? null)
    : null;

  const stripe = getStripe();
  if (subscriptionId && !stripe) {
    return { ok: false, error: "Stripe is not configured on this server.", status: 503 };
  }

  const nowIso = new Date().toISOString();

  if (mode === "at_period_end") {
    if (!subscriptionId) {
      return {
        ok: false,
        error: "This is a one-time membership — there is no automatic renewal to stop.",
        status: 400,
      };
    }

    let endsOn: string | null;
    try {
      const subscription = await stripe!.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      endsOn =
        unixToDate(subscription.cancel_at) ??
        unixToDate(subscription.items.data[0]?.current_period_end) ??
        membership.current_period_end;
    } catch (error) {
      return { ok: false, error: errorMessage(error, "Stripe rejected the cancellation."), status: 502 };
    }

    const { error: updateError } = await supabase
      .from("memberships")
      .update({ cancel_at_period_end: true, current_period_end: endsOn, canceled_at: nowIso })
      .eq("id", membershipId);
    if (updateError) return { ok: false, error: updateError.message, status: 500 };

    return {
      ok: true,
      result: { mode, memberName, endsOn, refundAmount: null, refundId: null, warning: null },
    };
  }

  // immediate_refund — stop the billing first. If the refund then fails we have
  // at least not left the subscription charging, and the caller is told plainly
  // that the money has not moved.
  const payment = await latestPayment(supabase, membershipId);

  if (subscriptionId) {
    try {
      await stripe!.subscriptions.cancel(subscriptionId);
    } catch (error) {
      return { ok: false, error: errorMessage(error, "Stripe rejected the cancellation."), status: 502 };
    }
  }

  let refundAmount: number | null = null;
  let refundId: string | null = null;
  let warning: string | null = null;

  if (stripe) {
    try {
      const target = await findRefundTarget(
        stripe,
        subscriptionId,
        payment?.stripe_transaction_id ?? null,
      );
      if (!target) {
        warning =
          "The membership was cancelled, but no Stripe payment could be found to refund. Refund it in the Stripe dashboard if one is owed.";
      } else {
        const refund = await stripe.refunds.create({ ...target, reason: "requested_by_customer" });
        refundId = refund.id;
        refundAmount = refund.amount / 100;
      }
    } catch (error) {
      warning = `The membership was cancelled, but the refund failed: ${errorMessage(
        error,
        "unknown Stripe error",
      )}. Refund it in the Stripe dashboard.`;
    }
  } else {
    warning = "The membership was cancelled, but Stripe is not configured so no refund was issued.";
  }

  const { error: updateError } = await supabase
    .from("memberships")
    .update({
      status: "Cancelled",
      cancel_at_period_end: false,
      canceled_at: nowIso,
    })
    .eq("id", membershipId);
  if (updateError) return { ok: false, error: updateError.message, status: 500 };

  if (payment && refundId) {
    await supabase
      .from("payments")
      .update({ refunded_at: nowIso, refund_amount: refundAmount, stripe_refund_id: refundId })
      .eq("id", payment.id);
  }

  return {
    ok: true,
    result: { mode, memberName, endsOn: null, refundAmount, refundId, warning },
  };
}

import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { MembershipsUpdate } from "@/types/database";

/**
 * Events that change what a membership actually is, as opposed to creating one.
 * Without these the database only ever learns about signups: renewals, failed
 * payments, refunds, and cancellations made directly in the Stripe dashboard all
 * pass silently, which is why every membership row read "Active" indefinitely.
 */
export const SUBSCRIPTION_EVENT_TYPES = [
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "charge.refunded",
] as const;

export type SubscriptionEventType = (typeof SUBSCRIPTION_EVENT_TYPES)[number];

export function isSubscriptionEvent(type: string): type is SubscriptionEventType {
  return (SUBSCRIPTION_EVENT_TYPES as readonly string[]).includes(type);
}

export type SyncResult = { ok: true; handled: boolean; note?: string } | { ok: false; error: string };

function unixToDate(seconds: number | null | undefined): string | null {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function findMembershipBySubscription(supabase: SupabaseClient, subscriptionId: string) {
  const { data } = await supabase
    .from("memberships")
    .select("id, status")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();
  return data as { id: string; status: string | null } | null;
}

async function applyUpdate(
  supabase: SupabaseClient,
  membershipId: string,
  patch: MembershipsUpdate,
): Promise<SyncResult> {
  const { error } = await supabase.from("memberships").update(patch).eq("id", membershipId);
  if (error) return { ok: false, error: error.message };
  return { ok: true, handled: true };
}

/**
 * Reconcile one Stripe event into the memberships/payments tables. Returns
 * `handled: false` when the event refers to something we don't track, so the
 * webhook can acknowledge it rather than making Stripe retry forever.
 */
export async function syncSubscriptionEvent(event: Stripe.Event): Promise<SyncResult> {
  const supabase = createAdminSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase service role is not configured." };

  switch (event.type) {
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const membership = await findMembershipBySubscription(supabase, subscription.id);
      if (!membership) return { ok: true, handled: false, note: "no membership for subscription" };

      const periodEnd =
        unixToDate(subscription.cancel_at) ??
        unixToDate(subscription.items.data[0]?.current_period_end);

      const patch: MembershipsUpdate = {
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: periodEnd,
      };
      // Stripe is the source of truth for whether it is still billing.
      if (subscription.status === "canceled") {
        patch.status = "Cancelled";
        patch.canceled_at = unixToDate(subscription.canceled_at)
          ? new Date((subscription.canceled_at as number) * 1000).toISOString()
          : new Date().toISOString();
      }
      return applyUpdate(supabase, membership.id, patch);
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const membership = await findMembershipBySubscription(supabase, subscription.id);
      if (!membership) return { ok: true, handled: false, note: "no membership for subscription" };

      return applyUpdate(supabase, membership.id, {
        status: "Cancelled",
        cancel_at_period_end: false,
        canceled_at: new Date(
          (subscription.canceled_at ?? Math.floor(Date.now() / 1000)) * 1000,
        ).toISOString(),
      });
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = idOf(
        (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription }).subscription,
      );
      if (!subscriptionId) return { ok: true, handled: false, note: "invoice has no subscription" };

      const membership = await findMembershipBySubscription(supabase, subscriptionId);
      if (!membership) return { ok: true, handled: false, note: "no membership for subscription" };

      const paidOn = unixToDate(invoice.status_transitions?.paid_at) ?? unixToDate(invoice.created);

      // A renewal makes a lapsed membership current again.
      const update = await applyUpdate(supabase, membership.id, {
        last_renewal: paidOn,
        status: "Active",
        current_period_end: unixToDate(invoice.period_end),
      });
      if (!update.ok) return update;

      // Record the money. Dedupe on the invoice id the same way signup dedupes
      // on the subscription/payment-intent id, so Stripe retries are harmless.
      const { data: existing } = await supabase
        .from("payments")
        .select("id")
        .eq("stripe_transaction_id", invoice.id)
        .maybeSingle();
      if (existing) return { ok: true, handled: true, note: "payment already recorded" };

      const { data: person } = await supabase
        .from("people")
        .select("id")
        .eq("membership_id", membership.id)
        .maybeSingle();

      const { error: paymentError } = await supabase.from("payments").insert({
        person_id: (person?.id as string | undefined) ?? null,
        membership_id: membership.id,
        amount: (invoice.amount_paid ?? 0) / 100,
        date: paidOn ?? new Date().toISOString().slice(0, 10),
        type: "membership",
        method: "stripe",
        stripe_transaction_id: invoice.id,
      });
      if (paymentError) return { ok: false, error: paymentError.message };
      return { ok: true, handled: true };
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = idOf(
        (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription }).subscription,
      );
      if (!subscriptionId) return { ok: true, handled: false, note: "invoice has no subscription" };

      const membership = await findMembershipBySubscription(supabase, subscriptionId);
      if (!membership) return { ok: true, handled: false, note: "no membership for subscription" };

      // `membership_status_enum` has no "past due" label, so a failed payment
      // reads as Expired. If that distinction starts to matter operationally it
      // needs its own enum migration rather than an invented value here.
      return applyUpdate(supabase, membership.id, { status: "Expired" });
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = idOf(charge.payment_intent);

      // Find the payment by any id we might have stored against it. Signup
      // stores the subscription or payment-intent id; renewals store the
      // invoice id — and `charge.invoice` is only present on some API versions.
      const invoiceId = idOf(
        (charge as Stripe.Charge & { invoice?: string | Stripe.Invoice }).invoice ?? null,
      );
      const candidates = [invoiceId, charge.id, paymentIntentId].filter(
        (value): value is string => Boolean(value),
      );
      if (candidates.length === 0) return { ok: true, handled: false, note: "no id to match" };

      const { data: payment } = await supabase
        .from("payments")
        .select("id")
        .in("stripe_transaction_id", candidates)
        .maybeSingle();
      if (!payment) return { ok: true, handled: false, note: "no payment row for charge" };

      const { error } = await supabase
        .from("payments")
        .update({
          refunded_at: new Date().toISOString(),
          refund_amount: (charge.amount_refunded ?? 0) / 100,
          stripe_refund_id: idOf(charge.refunds?.data?.[0] ?? null),
        })
        .eq("id", payment.id);
      if (error) return { ok: false, error: error.message };
      return { ok: true, handled: true };
    }

    default:
      return { ok: true, handled: false };
  }
}

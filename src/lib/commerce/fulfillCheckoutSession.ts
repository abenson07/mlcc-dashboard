import type Stripe from "stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  COMMERCE_FLOW,
  COMMERCE_METADATA_KEYS,
  isCommerceFlow,
} from "@/lib/stripe/commerceMetadata";
import type { TshirtLineItem } from "@/types/database";
import {
  sendFundraiserThankYouEmail,
  sendTshirtConfirmationEmail,
} from "@/lib/commerce/commerceEmail";
import type { FundraisingDonationTier } from "@/types/database";

function parseLineItemsJson(raw: string | undefined): TshirtLineItem[] | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const items: TshirtLineItem[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      if (o.category !== "adult" && o.category !== "child") continue;
      if (typeof o.size !== "string") continue;
      const quantity = Number(o.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) continue;
      items.push({
        category: o.category,
        size: o.size,
        quantity,
      });
    }
    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

function shippingFromMetadata(
  metadata: Stripe.Metadata
): Record<string, string> | null {
  const line1 = metadata[COMMERCE_METADATA_KEYS.shippingLine1]?.trim();
  const city = metadata[COMMERCE_METADATA_KEYS.shippingCity]?.trim();
  const state = metadata[COMMERCE_METADATA_KEYS.shippingState]?.trim();
  const postal = metadata[COMMERCE_METADATA_KEYS.shippingPostalCode]?.trim();
  if (!line1 && !city) return null;
  return {
    line1: line1 ?? "",
    line2: metadata[COMMERCE_METADATA_KEYS.shippingLine2]?.trim() ?? "",
    city: city ?? "",
    state: state ?? "",
    postal_code: postal ?? "",
    country: "US",
  };
}

function parseDonationTier(raw: string | undefined): FundraisingDonationTier {
  const t = raw?.trim().toLowerCase();
  if (t === "household" || t === "champ" || t === "custom") return t;
  if (t === "individual") return "individual";
  return "custom";
}

export type FulfillResult =
  | { ok: true; flow: string; alreadyFulfilled?: boolean }
  | { ok: false; error: string };

export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<FulfillResult> {
  const flow = session.metadata?.[COMMERCE_METADATA_KEYS.flow];
  if (!isCommerceFlow(flow)) {
    return { ok: false, error: "Not a commerce checkout session" };
  }

  if (session.payment_status !== "paid" && session.status !== "complete") {
    return { ok: false, error: "Session not paid" };
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase admin client not configured" };
  }

  const sessionId = session.id;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  const amountCents = session.amount_total ?? 0;
  const currency = (session.currency ?? "usd").toLowerCase();

  if (flow === COMMERCE_FLOW.TSHIRT) {
    const { data: existing } = await supabase
      .from("tshirt_preorders")
      .select("id, status")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();

    if (existing?.status === "paid") {
      return { ok: true, flow, alreadyFulfilled: true };
    }

    const lineItems =
      parseLineItemsJson(session.metadata?.[COMMERCE_METADATA_KEYS.lineItems]) ??
      [];
    const customerName =
      session.metadata?.[COMMERCE_METADATA_KEYS.customerName]?.trim() ??
      session.customer_details?.name ??
      "Guest";
    const customerEmail =
      session.metadata?.[COMMERCE_METADATA_KEYS.customerEmail]?.trim() ??
      session.customer_details?.email ??
      session.customer_email ??
      "";

    if (!customerEmail) {
      return { ok: false, error: "Missing customer email on session" };
    }

    const shipping = shippingFromMetadata(session.metadata ?? {});

    const row = {
      stripe_checkout_session_id: sessionId,
      stripe_payment_intent_id: paymentIntentId,
      customer_name: customerName,
      customer_email: customerEmail,
      shipping_address: shipping,
      line_items: lineItems,
      amount_cents: amountCents,
      currency,
      status: "paid" as const,
      updated_at: new Date().toISOString(),
    };

    const { error } = existing
      ? await supabase
          .from("tshirt_preorders")
          .update(row)
          .eq("stripe_checkout_session_id", sessionId)
      : await supabase.from("tshirt_preorders").insert(row);

    if (error) {
      return { ok: false, error: error.message };
    }

    if (lineItems.length > 0) {
      await sendTshirtConfirmationEmail({
        to: customerEmail,
        customerName,
        lineItems,
        amountCents,
      });
    }

    return { ok: true, flow };
  }

  if (flow === COMMERCE_FLOW.FUNDRAISER) {
    const { data: existing } = await supabase
      .from("fundraising_donations")
      .select("id, status")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();

    if (existing?.status === "paid") {
      return { ok: true, flow, alreadyFulfilled: true };
    }

    const tier = parseDonationTier(
      session.metadata?.[COMMERCE_METADATA_KEYS.donationTier]
    );
    const customerEmail =
      session.metadata?.[COMMERCE_METADATA_KEYS.customerEmail]?.trim() ??
      session.customer_details?.email ??
      session.customer_email ??
      null;

    const row = {
      stripe_checkout_session_id: sessionId,
      stripe_payment_intent_id: paymentIntentId,
      donation_tier: tier,
      amount_cents: amountCents,
      currency,
      customer_email: customerEmail,
      status: "paid" as const,
      updated_at: new Date().toISOString(),
    };

    const { error } = existing
      ? await supabase
          .from("fundraising_donations")
          .update(row)
          .eq("stripe_checkout_session_id", sessionId)
      : await supabase.from("fundraising_donations").insert(row);

    if (error) {
      return { ok: false, error: error.message };
    }

    if (customerEmail) {
      await sendFundraiserThankYouEmail({
        to: customerEmail,
        amountCents,
        tier,
      });
    }

    return { ok: true, flow };
  }

  return { ok: false, error: "Unknown commerce flow" };
}

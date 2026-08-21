import type Stripe from "stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  COMMERCE_FLOW,
  COMMERCE_METADATA_KEYS,
  isCommerceFlow,
} from "@/lib/stripe/commerceMetadata";
import type {
  FundraisingDonationTier,
  MembershipsInsert,
  PaymentsInsert,
  PeopleInsert,
  ShopLineItem,
  TshirtLineItem,
} from "@/types/database";
import {
  sendFundraiserThankYouEmail,
  sendMembershipConfirmationEmail,
  sendShopOrderConfirmationEmail,
  sendTshirtConfirmationEmail,
} from "@/lib/commerce/commerceEmail";
import {
  explodeShirtPreorderRows,
  upsertPersonForShopOrder,
} from "@/lib/commerce/recordShopPreorder";
import { findMembershipTier } from "@marketing/data/membership-tiers";
import { toMembershipTier } from "@/lib/memberships/status";
import { upsertNewsletterContact, upsertWeeklyDigestContact } from "@/lib/resendContacts";

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

function parseShopLineItemsJson(raw: string | undefined): ShopLineItem[] | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const items: ShopLineItem[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      if (typeof o.product_slug !== "string" || typeof o.variant !== "string") continue;
      const quantity = Number(o.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) continue;
      const fulfillment = o.fulfillment === "preorder" ? "preorder" : "in_stock";
      items.push({
        product_slug: o.product_slug,
        product_name: typeof o.product_name === "string" ? o.product_name : o.product_slug,
        variant: o.variant,
        quantity,
        unit_amount_cents:
          typeof o.unit_amount_cents === "number" ? o.unit_amount_cents : 0,
        fulfillment,
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

function formatAddressText(shipping: Record<string, string> | null): string | null {
  if (!shipping) return null;
  const parts = [
    shipping.line1,
    shipping.line2,
    [shipping.city, shipping.state, shipping.postal_code].filter(Boolean).join(", "),
  ].filter((p) => !!p?.trim());
  return parts.length > 0 ? parts.join(", ") : null;
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

  if (flow === COMMERCE_FLOW.SHOP) {
    // Preorders are recorded as pending at checkout-submit time. Webhook only
    // marks them paid when it arrives (optional; ops can reconcile later).
    const { data: existingItems, error: existingItemsError } = await supabase
      .from("shirt_preorder_items")
      .select("id, status")
      .eq("stripe_checkout_session_id", sessionId);

    if (existingItemsError) {
      return { ok: false, error: existingItemsError.message };
    }

    const hasItems = (existingItems?.length ?? 0) > 0;
    const allPaid =
      hasItems && existingItems!.every((item) => item.status === "paid");

    if (allPaid) {
      return { ok: true, flow, alreadyFulfilled: true };
    }

    const lineItems =
      parseShopLineItemsJson(session.metadata?.[COMMERCE_METADATA_KEYS.lineItems]) ?? [];
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
    const address = formatAddressText(shipping);

    if (hasItems) {
      const { error: markPaidError } = await supabase
        .from("shirt_preorder_items")
        .update({
          status: "paid",
          stripe_payment_intent_id: paymentIntentId,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_checkout_session_id", sessionId)
        .neq("status", "paid");
      if (markPaidError) {
        return { ok: false, error: markPaidError.message };
      }
    } else if (lineItems.length > 0) {
      // Fallback if pending rows were never written (older clients / failed insert).
      const personResult = await upsertPersonForShopOrder(supabase, {
        customerName,
        customerEmail,
        address,
      });
      if (!personResult.ok) {
        return { ok: false, error: personResult.error };
      }
      const shirtRows = explodeShirtPreorderRows({
        personId: personResult.personId,
        lineItems,
        sessionId,
        paymentIntentId,
        status: "paid",
      });
      const { error: shirtError } = await supabase
        .from("shirt_preorder_items")
        .insert(shirtRows);
      if (shirtError) {
        return { ok: false, error: shirtError.message };
      }
    }

    // Optional aggregate receipt table — ignore if missing.
    const { data: existingOrder } = await supabase
      .from("shop_orders")
      .select("id, status")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();

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

    const { error: shopOrderError } = existingOrder
      ? await supabase
          .from("shop_orders")
          .update(row)
          .eq("stripe_checkout_session_id", sessionId)
      : await supabase.from("shop_orders").insert(row);

    if (shopOrderError) {
      console.error(
        "[fulfillCheckoutSession] shop_orders write skipped:",
        shopOrderError.message
      );
    }

    if (lineItems.length > 0 && existingOrder?.status !== "paid" && !shopOrderError) {
      await sendShopOrderConfirmationEmail({
        to: customerEmail,
        customerName,
        lineItems,
        amountCents,
      });
    }

    return { ok: true, flow };
  }

  if (flow === COMMERCE_FLOW.MEMBERSHIP) {
    const tierSlug = session.metadata?.[COMMERCE_METADATA_KEYS.membershipTier]?.trim();
    const tierDef = tierSlug ? findMembershipTier(tierSlug) : undefined;
    if (!tierDef) {
      return { ok: false, error: "Unknown membership tier on session" };
    }

    const isSubscription =
      session.metadata?.[COMMERCE_METADATA_KEYS.billingMode] === "recurring";

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

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id ?? null;
    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

    // Membership rows don't carry a checkout session id, so dedupe on the
    // Stripe transaction id instead (subscription id for recurring, payment
    // intent id for one-time) — the same id we're about to store on the payment.
    const transactionId = isSubscription ? subscriptionId : paymentIntentId;
    if (transactionId) {
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("stripe_transaction_id", transactionId)
        .maybeSingle();
      if (existingPayment) {
        return { ok: true, flow, alreadyFulfilled: true };
      }
    }

    const newsletterOptIn =
      session.metadata?.[COMMERCE_METADATA_KEYS.newsletterOptIn] === "true";
    const digestOptIn = session.metadata?.[COMMERCE_METADATA_KEYS.digestOptIn] === "true";
    const volunteerOptIn = session.metadata?.[COMMERCE_METADATA_KEYS.volunteerOptIn] === "true";

    const { data: existingPerson } = await supabase
      .from("people")
      .select("id, tags")
      .eq("email", customerEmail)
      .maybeSingle();

    let personId: string;
    if (existingPerson) {
      personId = existingPerson.id;
      if (volunteerOptIn && !(existingPerson.tags ?? []).includes("volunteer_interested")) {
        const { error } = await supabase
          .from("people")
          .update({ tags: [...(existingPerson.tags ?? []), "volunteer_interested"] })
          .eq("id", personId);
        if (error) return { ok: false, error: error.message };
      }
    } else {
      const personRow: PeopleInsert = {
        full_name: customerName,
        email: customerEmail,
        source: "membership_checkout",
        tags: volunteerOptIn ? ["volunteer_interested"] : null,
      };
      const { data: inserted, error } = await supabase
        .from("people")
        .insert(personRow)
        .select("id")
        .single();
      if (error || !inserted) {
        return { ok: false, error: error?.message ?? "Failed to create person" };
      }
      personId = inserted.id;
    }

    const membershipRow: MembershipsInsert = {
      // Postgres enum labels are Title-cased; writing the lowercase slug here
      // failed the enum cast, which failed the whole fulfilment and left a
      // paying member with no database row.
      tier: toMembershipTier(tierDef.slug),
      status: "Active",
      last_renewal: null,
      payment_method: "stripe",
      is_subscription: isSubscription,
      start_date: new Date().toISOString().slice(0, 10),
      stripe_customer_id: customerId,
      stripe_subscription_id: isSubscription ? subscriptionId : null,
      customer_email: customerEmail,
    };
    const { data: membership, error: membershipError } = await supabase
      .from("memberships")
      .insert(membershipRow)
      .select("id")
      .single();
    if (membershipError || !membership) {
      return { ok: false, error: membershipError?.message ?? "Failed to create membership" };
    }

    const { error: linkError } = await supabase
      .from("people")
      .update({ membership_id: membership.id })
      .eq("id", personId);
    if (linkError) return { ok: false, error: linkError.message };

    const paymentRow: PaymentsInsert = {
      person_id: personId,
      membership_id: membership.id,
      amount: amountCents / 100,
      date: new Date().toISOString().slice(0, 10),
      type: "membership",
      method: "stripe",
      stripe_transaction_id: transactionId,
    };
    const { error: paymentError } = await supabase.from("payments").insert(paymentRow);
    if (paymentError) return { ok: false, error: paymentError.message };

    const firstName = customerName.trim().split(/\s+/)[0];
    if (newsletterOptIn) await upsertNewsletterContact(customerEmail, firstName);
    if (digestOptIn) await upsertWeeklyDigestContact(customerEmail, firstName);

    await sendMembershipConfirmationEmail({
      to: customerEmail,
      customerName,
      tierName: tierDef.name,
      amountCents,
      isSubscription,
    });

    return { ok: true, flow };
  }

  return { ok: false, error: "Unknown commerce flow" };
}

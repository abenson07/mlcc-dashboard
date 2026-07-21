import type Stripe from "stripe";
import { COMMERCE_FLOW, COMMERCE_METADATA_KEYS } from "@/lib/stripe/commerceMetadata";
import { getStripe } from "@/lib/stripe/server";
import { getMembershipProductId } from "@/lib/commerce/membershipProductEnv";
import type { MembershipBillingMode } from "@/lib/commerce/membershipTiers";
import { findMembershipTier, type MembershipTierSlug } from "@marketing/data/membership-tiers";

export type MembershipCustomerInfo = {
  name: string;
  email: string;
};

export type MembershipOptIns = {
  newsletter: boolean;
  digest: boolean;
  volunteer: boolean;
};

export async function createMembershipCheckoutSession(params: {
  tier: MembershipTierSlug;
  billingMode: MembershipBillingMode;
  customer: MembershipCustomerInfo;
  optIns: MembershipOptIns;
  returnOrigin: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");

  const tierDef = findMembershipTier(params.tier);
  if (!tierDef) throw new Error(`Unknown membership tier "${params.tier}"`);

  const productId = getMembershipProductId(params.tier);
  const isRecurring = params.billingMode === "recurring";

  const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
    currency: "usd",
    unit_amount: tierDef.priceCents,
    ...(productId
      ? { product: productId }
      : { product_data: { name: `${tierDef.name} Membership` } }),
    ...(isRecurring ? { recurring: { interval: "year" } } : {}),
  };

  const base = params.returnOrigin.replace(/\/$/, "");

  const metadata: Stripe.MetadataParam = {
    [COMMERCE_METADATA_KEYS.flow]: COMMERCE_FLOW.MEMBERSHIP,
    [COMMERCE_METADATA_KEYS.membershipTier]: tierDef.slug,
    [COMMERCE_METADATA_KEYS.billingMode]: params.billingMode,
    [COMMERCE_METADATA_KEYS.customerName]: params.customer.name.slice(0, 200),
    [COMMERCE_METADATA_KEYS.customerEmail]: params.customer.email.slice(0, 200),
    [COMMERCE_METADATA_KEYS.newsletterOptIn]: String(params.optIns.newsletter),
    [COMMERCE_METADATA_KEYS.digestOptIn]: String(params.optIns.digest),
    [COMMERCE_METADATA_KEYS.volunteerOptIn]: String(params.optIns.volunteer),
  };

  return stripe.checkout.sessions.create({
    mode: isRecurring ? "subscription" : "payment",
    line_items: [{ price_data: priceData, quantity: 1 }],
    customer_email: params.customer.email,
    // Subscriptions always get a Customer automatically; one-time payments need this
    // explicitly so we can still record stripe_customer_id after a one-time signup.
    ...(isRecurring ? {} : { customer_creation: "always" as const }),
    metadata,
    success_url: `${base}/membership/join/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/membership/join?tier=${tierDef.slug}`,
  });
}

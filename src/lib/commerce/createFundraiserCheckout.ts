import type Stripe from "stripe";
import {
  COMMERCE_FLOW,
  COMMERCE_METADATA_KEYS,
} from "@/lib/stripe/commerceMetadata";
import {
  CUSTOM_DONATION_MAX_CENTS,
  CUSTOM_DONATION_MIN_CENTS,
  FUNDRAISER_TIER_AMOUNTS,
  isPresetTier,
} from "@/lib/commerce/fundraiserTiers";
import type { FundraisingDonationTier } from "@/types/database";
import { getStripe } from "@/lib/stripe/server";

function donationPriceIdForTier(
  tier: Exclude<FundraisingDonationTier, "custom">
): string | null {
  const map: Record<typeof tier, string | undefined> = {
    individual: process.env.STRIPE_PRICE_DONATION_10,
    household: process.env.STRIPE_PRICE_DONATION_40,
    champ: process.env.STRIPE_PRICE_DONATION_100,
  };
  return map[tier]?.trim() || null;
}

function getDonationProductId(): string | null {
  return process.env.STRIPE_DONATION_PRODUCT_ID?.trim() || null;
}

export async function createFundraiserCheckoutSession(params: {
  tier: FundraisingDonationTier;
  amountCents?: number;
  email?: string;
  returnOrigin: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");

  const base = params.returnOrigin.replace(/\/$/, "");
  let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];

  if (isPresetTier(params.tier)) {
    const priceId = donationPriceIdForTier(params.tier);
    if (!priceId) {
      throw new Error(`Donation price for tier "${params.tier}" is not configured`);
    }
    lineItems = [{ price: priceId, quantity: 1 }];
  } else {
    const amount = params.amountCents;
    if (
      amount == null ||
      !Number.isInteger(amount) ||
      amount < CUSTOM_DONATION_MIN_CENTS ||
      amount > CUSTOM_DONATION_MAX_CENTS
    ) {
      throw new Error("Invalid custom donation amount");
    }
    const productId = getDonationProductId();
    if (!productId) {
      throw new Error("Donation product is not configured");
    }
    lineItems = [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product: productId,
        },
      },
    ];
  }

  const metadata: Stripe.MetadataParam = {
    [COMMERCE_METADATA_KEYS.flow]: COMMERCE_FLOW.FUNDRAISER,
    [COMMERCE_METADATA_KEYS.donationTier]: params.tier,
  };

  if (params.email?.trim()) {
    metadata[COMMERCE_METADATA_KEYS.customerEmail] = params.email
      .trim()
      .slice(0, 200);
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: lineItems,
    metadata,
    success_url: `${base}/fundraise/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/fundraise/cancelled.html`,
  };

  if (params.email?.trim()) {
    sessionParams.customer_email = params.email.trim();
  }

  return stripe.checkout.sessions.create(sessionParams);
}

export function presetAmountCentsForTier(
  tier: Exclude<FundraisingDonationTier, "custom">
): number {
  return FUNDRAISER_TIER_AMOUNTS[tier];
}

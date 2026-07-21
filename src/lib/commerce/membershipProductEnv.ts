import type { MembershipTierSlug } from "@marketing/data/membership-tiers";

const MEMBERSHIP_PRODUCT_ENV_KEYS: Record<MembershipTierSlug, string> = {
  household: "STRIPE_MEMBERSHIP_PRODUCT_ID_HOUSEHOLD",
  individual: "STRIPE_MEMBERSHIP_PRODUCT_ID_INDIVIDUAL",
  senior: "STRIPE_MEMBERSHIP_PRODUCT_ID_SENIOR",
  student: "STRIPE_MEMBERSHIP_PRODUCT_ID_STUDENT",
};

/** Optional Stripe product id for a tier, for dashboard reporting. Falls back to inline product_data when unset. */
export function getMembershipProductId(slug: MembershipTierSlug): string | null {
  const key = MEMBERSHIP_PRODUCT_ENV_KEYS[slug];
  return process.env[key]?.trim() || null;
}

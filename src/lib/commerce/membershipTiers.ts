import { findMembershipTier, type MembershipTierSlug } from "@marketing/data/membership-tiers";

export type MembershipBillingMode = "recurring" | "onetime";

export function parseMembershipTier(raw: unknown): MembershipTierSlug | null {
  if (typeof raw !== "string") return null;
  const slug = raw.trim().toLowerCase();
  return findMembershipTier(slug) ? (slug as MembershipTierSlug) : null;
}

export function parseBillingMode(raw: unknown): MembershipBillingMode {
  return raw === "onetime" ? "onetime" : "recurring";
}

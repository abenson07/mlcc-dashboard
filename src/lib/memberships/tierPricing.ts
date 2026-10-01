import { BUSINESS_MEMBERSHIP_ANNUAL_DUES } from "schemas/business_memberships";

/** Keep in step with `mlcc-website/data/membership-tiers.ts` (priceCents). */
export const MEMBERSHIP_TIER_CENTS = {
  Individual: 2500,
  Household: 4000,
  Senior: 500,
  Student: 500,
} as const;

export type PersonTierKey = keyof typeof MEMBERSHIP_TIER_CENTS;
export type CheckTierKey = PersonTierKey | "Business";

export const PERSON_TIER_KEYS = Object.keys(MEMBERSHIP_TIER_CENTS) as PersonTierKey[];

export function tierCents(tier: CheckTierKey): number {
  return tier === "Business"
    ? BUSINESS_MEMBERSHIP_ANNUAL_DUES * 100
    : MEMBERSHIP_TIER_CENTS[tier];
}

export function isPersonTier(value: unknown): value is PersonTierKey {
  return typeof value === "string" && value in MEMBERSHIP_TIER_CENTS;
}

export function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** "25", "$25.50", "1,000" → cents, or null when not a positive amount. */
export function parseDollarsToCents(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

import type { FundraisingDonationTier } from "@/types/database";

export const FUNDRAISER_TIER_AMOUNTS: Record<
  Exclude<FundraisingDonationTier, "custom">,
  number
> = {
  individual: 1000,
  household: 4000,
  champ: 10000,
};

export const CUSTOM_DONATION_MIN_CENTS = 100;
export const CUSTOM_DONATION_MAX_CENTS = 1_000_000;

export function isPresetTier(
  tier: string
): tier is Exclude<FundraisingDonationTier, "custom"> {
  return tier === "individual" || tier === "household" || tier === "champ";
}

export function parseDonationTier(raw: unknown): FundraisingDonationTier | null {
  if (typeof raw !== "string") return null;
  const tier = raw.trim().toLowerCase();
  if (
    tier === "individual" ||
    tier === "household" ||
    tier === "champ" ||
    tier === "custom"
  ) {
    return tier;
  }
  return null;
}

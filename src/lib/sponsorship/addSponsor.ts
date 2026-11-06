import type { SponsorshipStatus } from "schemas/sponsorships";

/**
 * Parses a typed amount like "$1,000"; null unless it is a positive number.
 * Never use `parseFloat` for this: `parseFloat("1,000")` is 1, which would send a $1 invoice.
 */
export function parseDollarAmount(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (!cleaned) return null;
  const amount = Number(cleaned);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

/** A new sponsor is a pledge unless someone says the money has already arrived. */
export function sponsorshipPaymentFields(
  alreadyPaid: boolean,
  today: string,
): { status: SponsorshipStatus; paid_date: string | null } {
  return alreadyPaid
    ? { status: "paid", paid_date: today }
    : { status: "pledged", paid_date: null };
}

/** Offer "create new business" only for a typed name that isn't already an exact match. */
export function canCreateBusinessFromSearch(
  search: string,
  existingNames: Array<string | null | undefined>,
): boolean {
  const name = search.trim().toLowerCase();
  if (!name) return false;
  return !existingNames.some((existing) => (existing ?? "").trim().toLowerCase() === name);
}

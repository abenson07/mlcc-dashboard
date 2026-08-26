import type { BusinessWithDetails } from "hooks";
import type { MembershipStatusEnum } from "schemas/memberships";
import { formatMembershipDate, toMembershipStatus } from "@/lib/memberships/status";
import {
  BUSINESS_MEMBERSHIP_ANNUAL_DUES,
  BUSINESS_MEMBERSHIP_TIER,
} from "schemas/business_memberships";
import type { BusinessMemberRow, BusinessRow, SponsorRow, SponsorshipLevel } from "./types";

export { BUSINESS_MEMBERSHIP_ANNUAL_DUES, BUSINESS_MEMBERSHIP_TIER };

export type BusinessesView = "members" | "sponsors" | "all";

export function hookFiltersForView(view: BusinessesView) {
  if (view === "members") return { isMember: true as const };
  if (view === "sponsors") return { isPastSponsor: true as const };
  return {};
}

/** Local calendar date as YYYY-MM-DD — `toISOString()` is UTC and can land on yesterday. */
export function localIsoDate(value: Date = new Date()): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseAnnualDues(raw: string): number | null {
  const trimmed = raw.replace(/[$,]/g, "").trim();
  if (!trimmed) return null;
  const amount = Number(trimmed);
  return Number.isFinite(amount) ? amount : null;
}

export function rowMembershipStatus(
  status: string | null | undefined,
): MembershipStatusEnum | "none" {
  return toMembershipStatus(status) ?? "none";
}

/** Real `sponsorships` has no stored "level" — bucket by amount using the same thresholds the leaflet sponsorship-tier seeds use (`src/lib/sponsorship/tierPlaceholders.ts`). */
function sponsorshipLevelFromAmount(amount: number): SponsorshipLevel {
  if (amount >= 2500) return "platinum";
  if (amount >= 1000) return "gold";
  if (amount >= 500) return "silver";
  return "bronze";
}

export function toBusinessRow(business: BusinessWithDetails): BusinessRow {
  return {
    id: business.id,
    businessName: business.business_name ?? "—",
    category: business.category?.trim() || "—",
    contactName: business.contact_name ?? "—",
    phone: business.phone ?? "—",
  };
}

export function toBusinessMemberRow(business: BusinessWithDetails): BusinessMemberRow {
  const membership = business.membership;
  return {
    id: business.id,
    businessName: business.business_name ?? "—",
    tier: membership ? BUSINESS_MEMBERSHIP_TIER : "—",
    renewalDate: formatMembershipDate(membership?.last_renewal) ?? "—",
    status: rowMembershipStatus(membership?.status),
    memberSince: formatMembershipDate(membership?.last_renewal) ?? "—",
    annualDues: membership?.annual_dues ?? 0,
  };
}

export function toSponsorRow(business: BusinessWithDetails): SponsorRow {
  const sponsorships = business.sponsorships ?? [];
  const dated = sponsorships.filter((s) => s.paid_date);
  const mostRecent = [...dated].sort((a, b) => (b.paid_date! < a.paid_date! ? -1 : 1))[0] ?? sponsorships[0];
  const earliest = [...dated].sort((a, b) => (a.paid_date! < a.paid_date! ? -1 : 1))[0] ?? sponsorships[0];
  const amount = mostRecent?.amount ?? 0;

  return {
    id: business.id,
    businessName: business.business_name ?? "—",
    sponsorshipLevel: sponsorshipLevelFromAmount(amount),
    amount,
    lastSponsoredYear: mostRecent?.paid_date ? new Date(mostRecent.paid_date).getFullYear() : new Date().getFullYear(),
    sponsorSince: formatMembershipDate(earliest?.paid_date) ?? "—",
  };
}

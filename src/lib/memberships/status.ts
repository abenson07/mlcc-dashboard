import type { MembershipStatusEnum, MembershipTierEnum, Memberships } from "schemas/memberships";

/**
 * The canonical membership vocabulary. These arrays must match the Postgres
 * enums `membership_status_enum` and `membership_tier_enum` label-for-label,
 * casing included — Postgres enum casts are case-sensitive, so writing "active"
 * instead of "Active" fails the same way writing a label that doesn't exist does.
 */
export const MEMBERSHIP_STATUSES = ["Active", "Expired", "Donation", "Cancelled"] as const;
export const MEMBERSHIP_TIERS = ["Household", "Individual", "Senior", "Student"] as const;

export const MEMBERSHIP_TIER_OPTIONS = MEMBERSHIP_TIERS.map((tier) => ({
  value: tier,
  label: tier,
}));

/**
 * Coerce a loose value (legacy lowercase rows, a slug from the marketing site,
 * user input) onto a canonical label. Returns null when there is no match —
 * callers should treat that as "don't write this" rather than guessing.
 */
export function toMembershipStatus(raw: unknown): MembershipStatusEnum | null {
  if (typeof raw !== "string") return null;
  const normalized = raw.trim().toLowerCase();
  return MEMBERSHIP_STATUSES.find((label) => label.toLowerCase() === normalized) ?? null;
}

export function toMembershipTier(raw: unknown): MembershipTierEnum | null {
  if (typeof raw !== "string") return null;
  const normalized = raw.trim().toLowerCase();
  return MEMBERSHIP_TIERS.find((label) => label.toLowerCase() === normalized) ?? null;
}

export type MembershipDisplayKey =
  | "active"
  | "ending"
  | "cancelled"
  | "expired"
  | "donation"
  | "none";

export type MembershipDisplayState = {
  key: MembershipDisplayKey;
  label: string;
  color: string;
};

const DISPLAY_COLOR: Record<MembershipDisplayKey, string> = {
  active: "#27a644",
  ending: "#f2994a",
  cancelled: "#8a8f98",
  expired: "#eb5757",
  donation: "#2f80ed",
  none: "#8a8f98",
};

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * These columns are Postgres `date`s, so they arrive as bare YYYY-MM-DD. Passing
 * that to `new Date()` parses it as UTC midnight, which renders as the previous
 * day for anyone west of UTC — a membership ending March 3rd would be shown to
 * an admin in Toronto as ending March 2nd. Build it from local components.
 */
export function formatMembershipDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const dateOnly = DATE_ONLY.exec(value);
  const parsed = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type DerivableMembership = Pick<
  Memberships,
  "status" | "cancel_at_period_end" | "current_period_end"
>;

/**
 * The displayed status is derived, never typed in by hand. A membership that an
 * admin has cancelled reads "Active" in the database right up until the paid
 * period closes — that's correct, and the "Ending <date>" state is how we show
 * the difference without inventing a status label the database can't store.
 */
export function deriveMembershipStatus(
  membership: DerivableMembership | null | undefined,
): MembershipDisplayState {
  if (!membership) return { key: "none", label: "No membership", color: DISPLAY_COLOR.none };

  const status = toMembershipStatus(membership.status);

  if (status === "Cancelled") {
    return { key: "cancelled", label: "Cancelled", color: DISPLAY_COLOR.cancelled };
  }
  if (status === "Expired") {
    return { key: "expired", label: "Expired", color: DISPLAY_COLOR.expired };
  }
  if (status === "Donation") {
    return { key: "donation", label: "Donation", color: DISPLAY_COLOR.donation };
  }

  if (membership.cancel_at_period_end) {
    const endsOn = formatMembershipDate(membership.current_period_end);
    return {
      key: "ending",
      label: endsOn ? `Ending ${endsOn}` : "Not renewing",
      color: DISPLAY_COLOR.ending,
    };
  }

  if (status === "Active") {
    return { key: "active", label: "Active", color: DISPLAY_COLOR.active };
  }

  // An unrecognised value in the column — surface it rather than hiding it,
  // so bad data is visible instead of silently rendering as "Active".
  return {
    key: "none",
    label: membership.status ? String(membership.status) : "No status",
    color: DISPLAY_COLOR.none,
  };
}

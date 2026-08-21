import { describe, expect, it } from "vitest";
import {
  MEMBERSHIP_STATUSES,
  MEMBERSHIP_TIERS,
  deriveMembershipStatus,
  toMembershipStatus,
  toMembershipTier,
} from "./status";

describe("toMembershipStatus", () => {
  it("accepts the database's own labels unchanged", () => {
    for (const label of MEMBERSHIP_STATUSES) {
      expect(toMembershipStatus(label)).toBe(label);
    }
  });

  it("repairs casing rather than writing a value the enum rejects", () => {
    expect(toMembershipStatus("active")).toBe("Active");
    expect(toMembershipStatus("  CANCELLED ")).toBe("Cancelled");
  });

  it("returns null for labels the enum has never had", () => {
    // The bug that started all this: the admin UI offered these four.
    expect(toMembershipStatus("lapsed")).toBeNull();
    expect(toMembershipStatus("past_due")).toBeNull();
    expect(toMembershipStatus("pending")).toBeNull();
    expect(toMembershipStatus(undefined)).toBeNull();
  });
});

describe("toMembershipTier", () => {
  it("maps the marketing site's lowercase slugs onto enum labels", () => {
    expect(toMembershipTier("household")).toBe("Household");
    expect(toMembershipTier("student")).toBe("Student");
  });

  it("accepts the database's own labels unchanged", () => {
    for (const label of MEMBERSHIP_TIERS) {
      expect(toMembershipTier(label)).toBe(label);
    }
  });

  it("returns null for anything else", () => {
    expect(toMembershipTier("no-tier")).toBeNull();
    expect(toMembershipTier(null)).toBeNull();
  });
});

describe("deriveMembershipStatus", () => {
  const base = { status: "Active" as const, cancel_at_period_end: false, current_period_end: null };

  it("reads Active when nothing is cancelled", () => {
    expect(deriveMembershipStatus(base)).toMatchObject({ key: "active", label: "Active" });
  });

  it("shows the end date for a membership that is running out", () => {
    const result = deriveMembershipStatus({
      ...base,
      cancel_at_period_end: true,
      current_period_end: "2027-03-03",
    });
    expect(result.key).toBe("ending");
    expect(result.label).toBe("Ending Mar 3, 2027");
  });

  it("falls back to a plain label when the end date is unknown", () => {
    expect(deriveMembershipStatus({ ...base, cancel_at_period_end: true })).toMatchObject({
      key: "ending",
      label: "Not renewing",
    });
  });

  it("prefers an explicit Cancelled over the pending-cancellation state", () => {
    expect(
      deriveMembershipStatus({
        status: "Cancelled",
        cancel_at_period_end: true,
        current_period_end: "2027-03-03",
      }),
    ).toMatchObject({ key: "cancelled", label: "Cancelled" });
  });

  it("surfaces an unrecognised stored value instead of rendering it as Active", () => {
    const result = deriveMembershipStatus({
      status: "lapsed" as never,
      cancel_at_period_end: false,
      current_period_end: null,
    });
    expect(result.key).toBe("none");
    expect(result.label).toBe("lapsed");
  });

  it("handles a person with no membership", () => {
    expect(deriveMembershipStatus(null)).toMatchObject({ key: "none", label: "No membership" });
  });
});

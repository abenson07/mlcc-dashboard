import { describe, expect, it } from "vitest";
import {
  canCreateBusinessFromSearch,
  parseSponsorAmount,
  sponsorshipPaymentFields,
} from "./addSponsor";

describe("parseSponsorAmount", () => {
  it("accepts plain and formatted amounts", () => {
    expect(parseSponsorAmount("500")).toBe(500);
    expect(parseSponsorAmount("$1,000")).toBe(1000);
    expect(parseSponsorAmount(" 250.50 ")).toBe(250.5);
  });

  it("rejects blank, zero, negative and non-numeric amounts", () => {
    for (const raw of ["", "   ", "0", "-5", "abc"]) {
      expect(parseSponsorAmount(raw)).toBeNull();
    }
  });
});

describe("sponsorshipPaymentFields", () => {
  it("records a pledge with no paid date by default", () => {
    expect(sponsorshipPaymentFields(false, "2026-11-06")).toEqual({
      status: "pledged",
      paid_date: null,
    });
  });

  it("records payment only when already paid", () => {
    expect(sponsorshipPaymentFields(true, "2026-11-06")).toEqual({
      status: "paid",
      paid_date: "2026-11-06",
    });
  });
});

describe("canCreateBusinessFromSearch", () => {
  it("offers a typed name that does not exist", () => {
    expect(canCreateBusinessFromSearch("Seattle Credit Union", ["Seattle Bakery", null])).toBe(true);
  });

  it("does not offer a blank search or an exact match in any case", () => {
    expect(canCreateBusinessFromSearch("   ", [])).toBe(false);
    expect(canCreateBusinessFromSearch(" seattle credit union ", ["Seattle Credit Union"])).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  defaultExpiresAtIso,
  defaultUrgentUntilIso,
  isPastRetentionArchive,
  parseIsoMs,
  RETENTION_MS_AFTER_EXPIRY,
  slugifyBase,
  validateUrgentWindow,
} from "./banner-helpers";

describe("slugifyBase", () => {
  it("normalizes names", () => {
    expect(slugifyBase("  Spring Gala!!  ")).toBe("spring-gala");
  });
});

describe("parseIsoMs", () => {
  it("parses valid ISO", () => {
    expect(parseIsoMs("2026-01-15T12:00:00.000Z")).toBeGreaterThan(0);
  });
  it("returns null for bad input", () => {
    expect(parseIsoMs(null)).toBeNull();
    expect(parseIsoMs("")).toBeNull();
  });
});

describe("isPastRetentionArchive", () => {
  it("is false before expiration + 30d", () => {
    const exp = "2026-06-01T00:00:00.000Z";
    const expMs = parseIsoMs(exp)!;
    expect(isPastRetentionArchive(exp, expMs + RETENTION_MS_AFTER_EXPIRY - 1)).toBe(
      false
    );
  });
  it("is true after expiration + 30d", () => {
    const exp = "2026-06-01T00:00:00.000Z";
    const expMs = parseIsoMs(exp)!;
    expect(isPastRetentionArchive(exp, expMs + RETENTION_MS_AFTER_EXPIRY + 1)).toBe(
      true
    );
  });
});

describe("defaultExpiresAtIso", () => {
  it("is about 30 days after now", () => {
    const nowMs = new Date("2026-03-01T12:00:00.000Z").getTime();
    const out = defaultExpiresAtIso(nowMs);
    const delta = parseIsoMs(out)! - nowMs;
    expect(delta).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
    expect(delta).toBeLessThan(31 * 24 * 60 * 60 * 1000);
  });
});

describe("defaultUrgentUntilIso", () => {
  it("caps at expiration", () => {
    const exp = "2026-06-01T00:00:00.000Z";
    const now = new Date("2026-05-20T00:00:00.000Z").getTime();
    const out = defaultUrgentUntilIso(exp, now);
    expect(parseIsoMs(out)!).toBeLessThanOrEqual(parseIsoMs(exp)!);
  });
});

describe("validateUrgentWindow", () => {
  it("rejects urgent-until after expiration", () => {
    const r = validateUrgentWindow(
      true,
      "2026-07-01T00:00:00.000Z",
      "2026-06-01T00:00:00.000Z"
    );
    expect(r.ok).toBe(false);
  });
  it("accepts valid pair", () => {
    const r = validateUrgentWindow(
      true,
      "2026-05-15T00:00:00.000Z",
      "2026-06-01T00:00:00.000Z"
    );
    expect(r.ok).toBe(true);
  });
});

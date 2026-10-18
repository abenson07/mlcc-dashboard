import { describe, expect, it } from "vitest";
import { isoToZonedInput, zonedInputToIso } from "./zoned";

describe("zoned date inputs (America/Los_Angeles)", () => {
  it("round-trips in daylight time", () => {
    expect(isoToZonedInput("2026-10-15T01:00:00.000Z")).toBe("2026-10-14T18:00");
    expect(zonedInputToIso("2026-10-14T18:00")).toBe("2026-10-15T01:00:00.000Z");
  });
  it("round-trips in standard time", () => {
    expect(isoToZonedInput("2026-12-15T02:00:00.000Z")).toBe("2026-12-14T18:00");
    expect(zonedInputToIso("2026-12-14T18:00")).toBe("2026-12-15T02:00:00.000Z");
  });
  it("handles empty and invalid input", () => {
    expect(isoToZonedInput(undefined)).toBe("");
    expect(zonedInputToIso("")).toBe("");
  });
});

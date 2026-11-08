import { describe, expect, it } from "vitest";
import { withDisplayName } from "@/lib/resend";
import { commSubject } from "./sendLeafletComm";

describe("commSubject", () => {
  it.each(["initial_confirmation", "confirmation_followup"])(
    "%s uses the Confirm your <leaflet> Routes subject",
    (stepKey) => {
      expect(commSubject(stepKey, "Winter 2026 Leaflet")).toBe(
        "Confirm your Winter 2026 Leaflet Routes",
      );
    },
  );

  it("leaves the reminder and completion subjects as they were", () => {
    expect(commSubject("pre_distribution_reminder", "Winter 2026 Leaflet")).toBe(
      "Confirm your routes — Winter 2026 Leaflet",
    );
    expect(commSubject("delivery_complete_prompt", "Winter 2026 Leaflet")).toBe(
      "Report delivery complete — Winter 2026 Leaflet",
    );
  });
});

describe("withDisplayName", () => {
  it("adds the name to a bare address", () => {
    expect(withDisplayName("hello@example.org", "Maple Leaf Community Council")).toBe(
      "Maple Leaf Community Council <hello@example.org>",
    );
  });

  it("keeps an address that already has a name", () => {
    expect(withDisplayName("MLCC <hello@example.org>", "Maple Leaf Community Council")).toBe(
      "MLCC <hello@example.org>",
    );
  });
});

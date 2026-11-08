import { describe, expect, it } from "vitest";
import { buildLeafletCommEmailHtml } from "./buildLeafletCommEmailHtml";

const ACTION_URL = "https://example.org/leaflet/respond?token=abc123";

function build(stepKey: string, variant: "confirm" | "complete" = "confirm") {
  return buildLeafletCommEmailHtml({
    delivererName: "Holly Reichmann",
    leafletTitle: "Winter 2026 Leaflet",
    distributionDate: "Saturday, Dec 12, 2026",
    routeLines: ["1st: 85th to 92nd (80 leaflets)"],
    actionUrl: ACTION_URL,
    variant,
    stepKey,
  });
}

describe("buildLeafletCommEmailHtml", () => {
  it.each(["initial_confirmation", "confirmation_followup"])(
    "%s email has no confirm link but keeps the rest",
    (stepKey) => {
      const html = build(stepKey);
      expect(html).not.toContain(ACTION_URL);
      expect(html).not.toContain("Confirm or respond");
      expect(html).not.toContain("copy and paste this link");
      expect(html).toContain("Hi Holly,");
      expect(html).toContain("Winter 2026 Leaflet");
      expect(html).toContain("1st: 85th to 92nd (80 leaflets)");
    },
  );

  it("reminder email keeps its View your routes link", () => {
    const html = build("pre_distribution_reminder");
    expect(html).toContain(ACTION_URL);
    expect(html).toContain("View your routes");
  });

  it("completion email keeps its Mark delivered link", () => {
    const html = build("delivery_complete_prompt", "complete");
    expect(html).toContain(ACTION_URL);
    expect(html).toContain("Mark delivered");
  });
});

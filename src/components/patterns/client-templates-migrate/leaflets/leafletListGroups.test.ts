import { describe, expect, it } from "vitest";
import type { LeafletSummary } from "@/data/mocks/leaflets";
import { groupLeafletsForList } from "./leafletListGroups";

const leaflets: LeafletSummary[] = [
  { id: "future", title: "Future", distributionDate: "2026-12-01", status: "planned" },
  { id: "past", title: "Past", distributionDate: "2026-11-01", status: "closed" },
  { id: "current", title: "Current", distributionDate: "2026-11-15", status: "active" },
  { id: "older", title: "Older", distributionDate: "2026-11-02", status: "closed" },
];

describe("All Leaflets grouping", () => {
  it("places the active issue first without duplicating it or reordering the remaining month groups", () => {
    expect(groupLeafletsForList(leaflets).map(([label, rows]) => [label, rows.map((row) => row.id)]))
      .toEqual([
        ["Active issue", ["current"]],
        ["December 2026", ["future"]],
        ["November 2026", ["past", "older"]],
      ]);
    expect(leaflets.map((row) => row.id)).toEqual(["future", "past", "current", "older"]);
  });

  it("moves the newly active issue to the top after a status change", () => {
    const changed = leaflets.map((leaflet): LeafletSummary => ({
      ...leaflet,
      status: leaflet.id === "past" ? "active" : leaflet.status === "active" ? "closed" : leaflet.status,
    }));
    const groups = groupLeafletsForList(changed);
    expect(groups[0]).toEqual(["Active issue", [changed[1]]]);
    expect(groups.flatMap(([, rows]) => rows).map((row) => row.id))
      .toEqual(["past", "future", "current", "older"]);
  });

  it("omits an empty active section and handles an empty list", () => {
    expect(groupLeafletsForList(leaflets.filter((row) => row.status !== "active")).map(([label]) => label))
      .toEqual(["December 2026", "November 2026"]);
    expect(groupLeafletsForList([])).toEqual([]);
  });
});

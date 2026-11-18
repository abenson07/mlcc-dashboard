import type { LeafletSummary } from "@/data/mocks/leaflets";

export function groupLeafletsForList(leaflets: LeafletSummary[]): [string, LeafletSummary[]][] {
  const active = leaflets.filter((leaflet) => leaflet.status === "active");
  const months = new Map<string, LeafletSummary[]>();
  for (const leaflet of leaflets) {
    if (leaflet.status === "active") continue;
    const date = new Date(`${leaflet.distributionDate}T12:00:00`);
    const month = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const bucket = months.get(month);
    if (bucket) bucket.push(leaflet);
    else months.set(month, [leaflet]);
  }
  const groups: [string, LeafletSummary[]][] = active.length ? [["Active issue", active]] : [];
  return [...groups, ...months.entries()];
}

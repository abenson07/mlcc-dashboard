import type { LeafletRouteRow } from "@/data/mocks/leaflets";

export function routeAssignmentCandidates(
  routes: LeafletRouteRow[],
  personId: string,
  search: string,
): LeafletRouteRow[] {
  const query = search.trim().toLowerCase();
  return routes
    .filter((route) => route.personId !== personId)
    .filter((route) =>
      query
        ? route.name.toLowerCase().includes(query)
        : route.status === "unassigned" || route.status === "skipped",
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

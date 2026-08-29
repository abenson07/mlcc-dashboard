export type OpenRoute = {
  slug: string;
  deliveryId?: string;
  routeName: string;
  description: string;
  timeCommitment: string;
  image: string;
  routeType?: string | null;
  leafletCount?: number | null;
  isSkipped?: boolean;
  leafletTitle?: string | null;
};

const DEFAULT_IMAGE = "/images/leaflet/leaflet.webp";

export const openRoutes: OpenRoute[] = [
  {
    slug: "15th-ave-90th-to-95th",
    routeName: "15th Ave: 90th to 95th",
    description: "Deliver the Leaflet to homes along 15th Ave NE between NE 90th and NE 95th St.",
    timeCommitment: "About 1 hour, a few times a year",
    image: DEFAULT_IMAGE,
    routeType: "Single family residences",
    leafletCount: 42,
  },
  {
    slug: "roosevelt-way-85th-to-90th",
    routeName: "Roosevelt Way: 85th to 90th",
    description: "Deliver the Leaflet to homes along Roosevelt Way NE between NE 85th and NE 90th St.",
    timeCommitment: "About 1 hour, a few times a year",
    image: DEFAULT_IMAGE,
    routeType: "Single family residences",
    leafletCount: 38,
  },
  {
    slug: "5th-ave-ne-95th-to-100th",
    routeName: "5th Ave NE: 95th to 100th",
    description: "Deliver the Leaflet to homes along 5th Ave NE between NE 95th and NE 100th St.",
    timeCommitment: "About 1 hour, a few times a year",
    image: DEFAULT_IMAGE,
    routeType: "Condo/apartment",
    leafletCount: 64,
  },
];

function formatHouseholds(count: number | null | undefined): string | null {
  if (count == null || count <= 0) return null;
  return `${count} household${count === 1 ? "" : "s"}`;
}

export function publicRouteToOpenRoute(route: {
  slug: string;
  deliveryId: string;
  routeName: string;
  routeType: string | null;
  leafletCount: number | null;
  isSkipped: boolean;
  leafletTitle: string | null;
}): OpenRoute {
  const households = formatHouseholds(route.leafletCount);
  const typeLabel = route.routeType?.trim() || null;
  const timeCommitment = [households, typeLabel, route.isSkipped ? "Needs a substitute" : null]
    .filter(Boolean)
    .join(" · ");

  return {
    slug: route.slug,
    deliveryId: route.deliveryId,
    routeName: route.routeName,
    description: `Deliver the Leaflet door to door on ${route.routeName}. About an hour, a few times a year.`,
    timeCommitment: timeCommitment || "About 1 hour, a few times a year",
    image: DEFAULT_IMAGE,
    routeType: typeLabel,
    leafletCount: route.leafletCount,
    isSkipped: route.isSkipped,
    leafletTitle: route.leafletTitle,
  };
}

export function formatRouteMeta(route: OpenRoute): string {
  return route.timeCommitment;
}

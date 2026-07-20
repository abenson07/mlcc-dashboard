export type OpenRoute = {
  slug: string;
  routeName: string;
  description: string;
  timeCommitment: string;
  image: string;
};

export const openRoutes: OpenRoute[] = [
  {
    slug: "15th-ave-90th-to-95th",
    routeName: "15th Ave: 90th to 95th",
    description: "Deliver the Leaflet to homes along 15th Ave NE between NE 90th and NE 95th St.",
    timeCommitment: "About 1 hour, a few times a year",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695312357b037d99bca1b7e9_leaflet.webp",
  },
  {
    slug: "roosevelt-way-85th-to-90th",
    routeName: "Roosevelt Way: 85th to 90th",
    description: "Deliver the Leaflet to homes along Roosevelt Way NE between NE 85th and NE 90th St.",
    timeCommitment: "About 1 hour, a few times a year",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695312357b037d99bca1b7e9_leaflet.webp",
  },
  {
    slug: "5th-ave-ne-95th-to-100th",
    routeName: "5th Ave NE: 95th to 100th",
    description: "Deliver the Leaflet to homes along 5th Ave NE between NE 95th and NE 100th St.",
    timeCommitment: "About 1 hour, a few times a year",
    image:
      "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695312357b037d99bca1b7e9_leaflet.webp",
  },
];

export function formatRouteMeta(route: OpenRoute): string {
  return route.timeCommitment;
}

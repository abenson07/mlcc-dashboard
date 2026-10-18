import { fetchPublished } from "./sanity";
import { getAllEvents, isUpcoming, formatEventDate } from "./events";

export type BannerItem = { headline: string; linkText: string; linkPath: string; expiresAt?: string };

/**
 * Pinned Sanity banner items, then the four soonest upcoming events.
 * TODO: Leaflet stories and volunteer asks join the banner once those move to Sanity.
 * Expiry is re-checked in the browser, since pages are statically rendered.
 */
export async function getBannerItems(): Promise<BannerItem[]> {
  const [pinned, events] = await Promise.all([
    fetchPublished<BannerItem[]>(
      `*[_type == "bannerItem" && pinned == true && (!defined(expiresAt) || expiresAt > now())]{headline, linkText, linkPath, expiresAt}`,
    ),
    getAllEvents(),
  ]);
  const eventItems = events
    .filter((e) => isUpcoming(e))
    .slice(0, 4)
    .map((e) => ({ headline: `${e.title} — ${formatEventDate(e.startsAt)}`, linkText: "See event details", linkPath: `/events/${e.slug}` }));
  return [...pinned, ...eventItems];
}

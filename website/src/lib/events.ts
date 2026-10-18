import { fetchContent } from "./sanity";

const TZ = "America/Los_Angeles";

export type SanityEvent = {
  _id: string;
  title: string;
  slug: string;
  startsAt: string;
  endsAt?: string;
  category?: string;
  locationName?: string;
  mapQuery?: string;
  mapZoom?: number;
  shortDescription?: string;
  image?: unknown;
  imageAspect?: "landscape" | "portrait";
  imagePosition?: "left" | "right";
  externalUrl?: string;
  body?: unknown[];
};

const EVENT_FIELDS = /* groq */ `
  _id, title, "slug": slug.current, startsAt, endsAt, category, locationName, mapQuery, mapZoom,
  shortDescription, image, imageAspect, imagePosition, externalUrl, body
`;

export async function getAllEvents(edit = false): Promise<SanityEvent[]> {
  return fetchContent<SanityEvent[]>(
    `*[_type == "event" && defined(slug.current)] | order(startsAt asc){${EVENT_FIELDS}}`,
    {},
    edit,
  );
}

export const isUpcoming = (e: SanityEvent, now = Date.now()) => new Date(e.startsAt).getTime() >= now;

export function getRelatedEvents(all: SanityEvent[], currentSlug: string, limit = 2) {
  return all.filter((e) => isUpcoming(e) && e.slug !== currentSlug).slice(0, limit);
}

export const formatEventDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: TZ });

export const formatEventTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ });

export function eventMapEmbedUrl(e: SanityEvent) {
  const query = encodeURIComponent(e.mapQuery ?? `${e.locationName ?? ""}, Seattle, WA`);
  return `https://maps.google.com/maps?q=${query}&z=${e.mapZoom ?? 15}&output=embed`;
}

export function eventActionHref(e: SanityEvent) {
  if (e.externalUrl) return e.externalUrl;
  const query = e.mapQuery ?? `${e.locationName ?? ""}, Seattle, WA`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

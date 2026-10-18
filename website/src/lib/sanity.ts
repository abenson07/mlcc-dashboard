import { sanityClient } from "sanity:client";

const readToken = import.meta.env.SANITY_API_READ_TOKEN;

/** Published content only. Used at build time and for static pages. */
export function fetchPublished<T>(query: string, params: Record<string, unknown> = {}) {
  return sanityClient.fetch<T>(query, params, { perspective: "published" });
}

/** Drafts included. Needs the Viewer token; only call from routes with `prerender = false`. */
export function fetchDrafts<T>(query: string, params: Record<string, unknown> = {}) {
  return sanityClient.withConfig({ token: readToken }).fetch<T>(query, params, { perspective: "drafts" });
}

export const UPCOMING_EVENTS_QUERY = /* groq */ `*[_type == "event" && startsAt >= now()] | order(startsAt asc){
  title, "slug": slug.current, startsAt, endsAt, category, locationName, shortDescription, externalUrl
}`;

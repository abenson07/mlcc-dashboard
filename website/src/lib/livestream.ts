import { fetchContent } from "./sanity";

export type Livestream = {
  _id: string;
  title: string;
  dateLabel?: string;
  href?: string;
  youtubeId: string;
  heroImage?: unknown;
  heroBlurb?: string;
  featuredUntil?: string;
  body?: unknown[];
};

/** The most recently updated live stream document (there is normally just one featured at a time). */
export function getLivestream(edit = false) {
  return fetchContent<Livestream | null>(
    `*[_type == "livestream"] | order(_updatedAt desc)[0]{_id, title, dateLabel, href, youtubeId, heroImage, heroBlurb, featuredUntil, body}`,
    {},
    edit,
  );
}

export const livestreamEmbedUrl = (youtubeId: string) =>
  `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`;

import type { FaqWithPages } from "hooks";
import type { Stories, StoryStatus } from "@/types/database";
import { getBannerItems, type BannerItem } from "@marketing/data/banner";
import { formatLeafletAuthor } from "@marketing/data/leaflet-stories";
import type { Banner, ContentStatus, Faq, Story } from "./types";

function formatDate(isoDate: string | null): string | null {
  if (!isoDate) return null;
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function toStory(row: Stories, authorNameById: Map<string, string>): Story {
  const authorFromPerson = row.author_id ? authorNameById.get(row.author_id) : undefined;
  const authorFromSlug = row.author_slug ? formatLeafletAuthor(row.author_slug) : undefined;
  const authorFromText = row.author
    ? row.author.includes("-") && !row.author.includes(" ")
      ? formatLeafletAuthor(row.author)
      : row.author
    : undefined;
  return {
    id: row.id,
    title: row.title,
    author: authorFromPerson || authorFromText || authorFromSlug || "—",
    authorId: row.author_id ?? null,
    status: row.status === "published" ? "Published" : "Draft",
    publishedAt: formatDate(row.publish_date),
    publishDate: row.publish_date,
    body: row.body,
    slug: row.slug ?? undefined,
    imageUrl: row.cover_image_url ?? undefined,
  };
}

export function contentStatusToStoryStatus(status: ContentStatus): StoryStatus {
  return status === "Published" ? "published" : "draft";
}

/** Today's date as `YYYY-MM-DD`, for stamping `publish_date` when a story is marked Published. */
export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toFaq(row: FaqWithPages): Faq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    pages: row.pages,
  };
}


export function siteBannerId(item: BannerItem): string {
  return `site:${item.linkPath}`;
}

export function toBannerFromSiteItem(item: BannerItem): Banner {
  return {
    id: siteBannerId(item),
    title: item.headline,
    ctaText: item.linkText,
    link: item.linkPath,
    active: true,
    expiresAt: null,
  };
}

/** Same rotating ticker the public site renders in `RotatingBanner`. */
export function getSiteBanners(): Banner[] {
  return getBannerItems().map(toBannerFromSiteItem);
}

/** Active list = `active` flag on AND not yet past `expiresAt`; everything else is Inactive. */
export function bannerIsCurrentlyActive(banner: Banner, nowMs: number = Date.now()): boolean {
  if (!banner.active) return false;
  if (!banner.expiresAt) return true;
  const expMs = Date.parse(banner.expiresAt);
  if (Number.isNaN(expMs)) return true;
  return nowMs <= expMs;
}

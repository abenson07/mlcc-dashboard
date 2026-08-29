import type { Event, EventDetailContent } from "./events";

const EVENT_TIMEZONE = "America/Los_Angeles";
const FALLBACK_IMAGE = "/images/events/maple-leaf-park3.jpg";

export type PublishedEventRow = {
  name: string | null;
  starts_at: string | null;
  slug: string | null;
  committee?: string | null;
  field_data: Record<string, unknown> | null;
};

function formatEventDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: EVENT_TIMEZONE,
  });
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function fieldData(row: PublishedEventRow): Record<string, unknown> {
  return row.field_data && typeof row.field_data === "object" && !Array.isArray(row.field_data)
    ? row.field_data
    : {};
}

function isCommitteeMeeting(row: PublishedEventRow): boolean {
  return fieldData(row).kind === "committee_meeting";
}

function marketingBody(fd: Record<string, unknown>): string | undefined {
  const marketing = fd.marketing;
  if (!marketing || typeof marketing !== "object") return undefined;
  return asString((marketing as { body?: unknown }).body);
}

function marketingShort(fd: Record<string, unknown>): string | undefined {
  const marketing = fd.marketing;
  if (!marketing || typeof marketing !== "object") return undefined;
  return asString((marketing as { shortDescription?: unknown }).shortDescription);
}

function mapsSearchHref(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function detailFromBody(body: string): EventDetailContent {
  const parts = body
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    blocks: (parts.length > 0 ? parts : [body.trim()]).map((text) => ({
      kind: "paragraph" as const,
      text,
    })),
  };
}

export function mapRowToMarketingEvent(row: PublishedEventRow): Event | null {
  const slug = asString(row.slug);
  if (!slug || isCommitteeMeeting(row)) return null;

  const fd = fieldData(row);
  const title = asString(row.name) ?? "Event";
  const dateIso = asString(row.starts_at) ?? new Date().toISOString();
  const locationName = asString(fd.location) ?? "Maple Leaf";
  const address = asString(fd.address);
  const mapQuery = address ?? locationName;
  const isExternal = fd.kind === "external";
  const externalUrl = asString(fd.external_event_url);
  const shortDescription =
    asString(fd.description) ?? marketingShort(fd) ?? "";
  const body = marketingBody(fd);

  return {
    slug,
    title,
    dateIso,
    date: formatEventDate(dateIso),
    shortDescription,
    locationName,
    category: asString(fd.category) ?? asString(row.committee) ?? "Community",
    image: asString(fd.image_url) ?? FALLBACK_IMAGE,
    href: isExternal && externalUrl ? externalUrl : mapsSearchHref(mapQuery),
    external: isExternal || undefined,
    detail: body ? detailFromBody(body) : undefined,
    mapQuery,
  };
}

function overlayStaticWithRow(base: Event, row: PublishedEventRow): Event {
  const mapped = mapRowToMarketingEvent(row);
  if (!mapped) return base;

  const fd = fieldData(row);
  const body = marketingBody(fd);
  const locationFromAdmin = asString(fd.location);
  const addressFromAdmin = asString(fd.address);
  const hasAdminPlace = Boolean(locationFromAdmin || addressFromAdmin);

  return {
    ...base,
    title: mapped.title,
    dateIso: mapped.dateIso,
    date: mapped.date,
    locationName: locationFromAdmin ?? base.locationName,
    image: asString(fd.image_url) ?? base.image,
    shortDescription: mapped.shortDescription || base.shortDescription,
    category: asString(fd.category) ?? base.category,
    href: hasAdminPlace ? mapped.href : base.href,
    mapQuery: hasAdminPlace ? mapped.mapQuery : base.mapQuery,
    external: mapped.external ?? base.external,
    detail: body ? detailFromBody(body) : base.detail,
  };
}

export function mergeStaticWithPublished(
  staticList: Event[],
  publishedRows: PublishedEventRow[],
  unpublishedSlugs: string[] = [],
): Event[] {
  const hidden = new Set(unpublishedSlugs.filter(Boolean));
  const publishedBySlug = new Map<string, PublishedEventRow>();
  for (const row of publishedRows) {
    if (isCommitteeMeeting(row)) continue;
    const slug = asString(row.slug);
    if (!slug || hidden.has(slug)) continue;
    publishedBySlug.set(slug, row);
  }

  const merged: Event[] = [];
  const seen = new Set<string>();

  for (const item of staticList) {
    if (hidden.has(item.slug)) continue;
    const row = publishedBySlug.get(item.slug);
    merged.push(row ? overlayStaticWithRow(item, row) : item);
    seen.add(item.slug);
  }

  for (const [slug, row] of publishedBySlug) {
    if (seen.has(slug)) continue;
    const mapped = mapRowToMarketingEvent(row);
    if (mapped) merged.push(mapped);
  }

  return merged;
}

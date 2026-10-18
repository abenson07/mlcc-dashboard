#!/usr/bin/env npx tsx
/**
 * One-time import of the website's current content into Sanity:
 *   - events (static catalog merged with published Supabase rows, same as the live /events page)
 *   - the Fall Community Meeting live stream
 *   - its pinned banner item
 *
 * Idempotent: documents use fixed IDs (`event-<slug>`, `livestream-fall-2026`,
 * `banner-livestream`) and createOrReplace, so re-running updates instead of duplicating.
 * Sanity de-dupes identical image uploads by hash.
 *
 * Usage (loads the dashboard .env.local):
 *   npx tsx --env-file=.env.local scripts/import-website-to-sanity.ts            # dry run, writes nothing
 *   npx tsx --env-file=.env.local scripts/import-website-to-sanity.ts --apply    # writes to Sanity
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN
 * (and the Supabase vars, so published admin events are included).
 */

import { createClient, type SanityClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getMergedEvents, type Event, type EventDetailBlock } from "../mlcc-website/data/events";
import {
  communityMeetingLivestream,
  livestreamBannerItem,
  LIVESTREAM_HERO_ENDS_AT,
  type LivestreamBodyBlock,
} from "../mlcc-website/data/livestream";

const apply = process.argv.includes("--apply");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID / SANITY_API_WRITE_TOKEN (run with --env-file=.env.local)");
}

const client: SanityClient = createClient({ projectId, dataset, token, apiVersion: "2025-02-19", useCdn: false });

const PUBLIC_DIRS = [path.resolve("mlcc-website/public"), path.resolve("public")];

type Json = Record<string, unknown>;
let keyCounter = 0;
const key = () => `k${(keyCounter++).toString(36)}`;

/* ---------- images ---------- */

const imageCache = new Map<string, Promise<string | null>>();
const stats = { images: 0, missingImages: [] as string[] };

async function loadImageBytes(src: string): Promise<{ bytes: Buffer; filename: string } | null> {
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src);
    if (!res.ok) return null;
    return { bytes: Buffer.from(await res.arrayBuffer()), filename: path.basename(new URL(src).pathname) };
  }
  for (const dir of PUBLIC_DIRS) {
    try {
      return { bytes: await readFile(path.join(dir, src)), filename: path.basename(src) };
    } catch {
      /* try next dir */
    }
  }
  return null;
}

/** Returns the Sanity asset id for a site image path/URL (null if the file can't be found). */
function assetFor(src: string): Promise<string | null> {
  let pending = imageCache.get(src);
  if (!pending) {
    pending = (async () => {
      const file = await loadImageBytes(src);
      if (!file) {
        stats.missingImages.push(src);
        return null;
      }
      stats.images += 1;
      if (!apply) return `dry-run-asset:${src}`;
      const asset = await client.assets.upload("image", file.bytes, { filename: file.filename });
      return asset._id;
    })();
    imageCache.set(src, pending);
  }
  return pending;
}

async function imageField(src: string | undefined, alt?: string): Promise<Json | undefined> {
  if (!src) return undefined;
  const ref = await assetFor(src);
  if (!ref) return undefined;
  return { _type: "image", asset: { _type: "reference", _ref: ref }, ...(alt ? { alt } : {}) };
}

/* ---------- portable text ---------- */

function textBlock(text: string, style: "normal" | "h3" | "h4" = "normal", opts: { bullet?: boolean; link?: { text: string; href: string } } = {}): Json {
  const markDefs: Json[] = [];
  let children: Json[];
  const link = opts.link;
  const at = link ? text.indexOf(link.text) : -1;
  if (link && at >= 0) {
    const linkKey = key();
    markDefs.push({ _key: linkKey, _type: "link", href: link.href });
    const before = text.slice(0, at);
    const after = text.slice(at + link.text.length);
    children = [
      ...(before ? [{ _type: "span", _key: key(), text: before, marks: [] }] : []),
      { _type: "span", _key: key(), text: link.text, marks: [linkKey] },
      ...(after ? [{ _type: "span", _key: key(), text: after, marks: [] }] : []),
    ];
  } else {
    children = [{ _type: "span", _key: key(), text, marks: [] }];
  }
  return {
    _type: "block",
    _key: key(),
    style,
    markDefs,
    children,
    ...(opts.bullet ? { listItem: "bullet", level: 1 } : {}),
  };
}

async function eventBodyBlocks(blocks: EventDetailBlock[]): Promise<Json[]> {
  const out: Json[] = [];
  for (const b of blocks) {
    if (b.kind === "heading") out.push(textBlock(b.text, "h4"));
    else if (b.kind === "paragraph") {
      out.push(textBlock(b.text, "normal", b.linkText && b.href ? { link: { text: b.linkText, href: b.href } } : {}));
    } else if (b.kind === "list") for (const item of b.items) out.push(textBlock(item, "normal", { bullet: true }));
    else if (b.kind === "video") out.push({ _type: "youtube", _key: key(), youtubeId: b.youtubeId, title: b.title });
    else if (b.kind === "image") {
      const img = await imageField(b.src, b.alt);
      if (img) out.push({ ...img, _key: key(), ...(b.caption ? { caption: b.caption } : {}) });
    }
  }
  return out;
}

function livestreamBodyBlocks(blocks: readonly LivestreamBodyBlock[]): Json[] {
  const out: Json[] = [];
  for (const b of blocks) {
    if (b.kind === "heading") out.push(textBlock(b.text, "h3"));
    else if (b.kind === "subheading") out.push(textBlock(b.text, "h4"));
    else if (b.kind === "paragraph") out.push(textBlock(b.text));
    else {
      for (const item of b.items) {
        out.push(
          typeof item === "string"
            ? textBlock(item, "normal", { bullet: true })
            : textBlock(item.text, "normal", { bullet: true, link: { text: item.text, href: item.href } }),
        );
      }
    }
  }
  return out;
}

/* ---------- documents ---------- */

async function eventDoc(e: Event): Promise<Json> {
  const mapQuery = e.mapQuery;
  return {
    _id: `event-${e.slug}`,
    _type: "event",
    title: e.title,
    slug: { _type: "slug", current: e.slug },
    startsAt: e.dateIso,
    category: e.category || undefined,
    locationName: e.locationName || undefined,
    mapQuery,
    mapZoom: e.mapZoom,
    shortDescription: e.shortDescription || undefined,
    image: await imageField(e.image, e.title),
    imageAspect: e.imageAspect ?? "landscape",
    imagePosition: e.imagePosition ?? "left",
    body: e.detail ? await eventBodyBlocks(e.detail.blocks) : undefined,
    externalUrl: e.external ? e.href : undefined,
  };
}

async function livestreamDoc(): Promise<Json> {
  const l = communityMeetingLivestream;
  return {
    _id: "livestream-fall-2026",
    _type: "livestream",
    title: l.title,
    dateLabel: l.dateLabel,
    href: l.href,
    youtubeId: l.youtubeId,
    heroImage: await imageField(l.heroImage, l.heroImageAlt),
    heroBlurb: l.heroBlurb,
    featuredUntil: LIVESTREAM_HERO_ENDS_AT,
    body: livestreamBodyBlocks(l.body),
  };
}

function bannerDoc(): Json {
  return {
    _id: "banner-livestream",
    _type: "bannerItem",
    headline: livestreamBannerItem.headline,
    linkText: livestreamBannerItem.linkText,
    linkPath: livestreamBannerItem.linkPath,
    pinned: true,
    expiresAt: livestreamBannerItem.expiresAt,
  };
}

/* ---------- run ---------- */

function prune<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T; // drops undefined fields
}

async function main() {
  const events = await getMergedEvents();
  console.log(`${apply ? "APPLY" : "DRY RUN"} → ${projectId}/${dataset}`);
  console.log(`Events found (static + published admin): ${events.length}`);

  const docs: Json[] = [];
  for (const e of events) docs.push(prune(await eventDoc(e)));
  docs.push(prune(await livestreamDoc()));
  docs.push(prune(bannerDoc()));

  for (const d of docs) console.log(`  ${String(d._type).padEnd(10)} ${d._id}`);
  console.log(`Images to upload: ${stats.images}`);
  if (stats.missingImages.length) console.log(`Images NOT found (fields left empty):\n  ${[...new Set(stats.missingImages)].join("\n  ")}`);

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write.");
    return;
  }

  const tx = client.transaction();
  for (const d of docs) tx.createOrReplace(d as { _id: string; _type: string });
  const result = await tx.commit();
  console.log(`\nWrote ${result.results.length} documents.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

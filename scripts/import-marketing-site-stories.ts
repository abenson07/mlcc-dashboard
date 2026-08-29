#!/usr/bin/env npx tsx
/**
 * Import Leaflet stories from the public-site catalog
 * (`mlcc-website/data/leaflet-stories.ts`) into dashboard `public.stories`.
 *
 * Idempotent: de-dupes against existing rows by `slug`, then by title.
 *
 * Usage:
 *   npx tsx scripts/import-marketing-site-stories.ts --dry-run
 *   npx tsx scripts/import-marketing-site-stories.ts
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { leafletStories } from "../mlcc-website/data/leaflet-stories";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");
const SITE_ORIGIN = "https://www.mapleleafcommunity.org";

function parseEnvLine(line: string): { key: string; val: string } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) return null;
  const key = trimmed.slice(0, eq).trim();
  let val = trimmed.slice(eq + 1).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  return { key, val };
}

function loadEnvFiles(): void {
  for (const name of [".env.local", ".env"]) {
    const p = path.join(REPO_ROOT, name);
    if (!fs.existsSync(p)) continue;
    for (const rawLine of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const parsed = parseEnvLine(rawLine);
      if (!parsed) continue;
      if (process.env[parsed.key] === undefined || process.env[parsed.key] === "") {
        process.env[parsed.key] = parsed.val;
      }
    }
  }
}

function coverUrl(image: string | undefined): string | null {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${SITE_ORIGIN}${image.startsWith("/") ? image : `/${image}`}`;
}

function withoutMarketingFields<T extends Record<string, unknown>>(row: T) {
  const {
    slug: _slug,
    author_slug: _authorSlug,
    author_id: _authorId,
    story_type: _storyType,
    featured: _featured,
    ...rest
  } = row;
  return rest;
}

function isMissingColumnError(message: string): boolean {
  return /schema cache|column .* does not exist|could not find/i.test(message);
}

async function main() {
  loadEnvFiles();
  const dryRun = process.argv.includes("--dry-run");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let existing:
    | { id: string; slug: string | null; title: string; body: string | null }[]
    | null = null;
  const existingFull = await supabase.from("stories").select("id,slug,title,body");
  if (existingFull.error) {
    const existingBase = await supabase.from("stories").select("id,title,body");
    if (existingBase.error) {
      throw new Error(`Failed to read existing stories: ${existingBase.error.message}`);
    }
    existing = (existingBase.data ?? []).map((r) => ({ ...r, slug: null }));
  } else {
    existing = existingFull.data ?? [];
  }

  const existingBySlug = new Map(
    existing.filter((r) => r.slug).map((r) => [r.slug as string, r]),
  );
  const existingTitles = new Set(existing.map((r) => r.title));
  const existingEmptyDraftByTitle = new Map(
    existing
      .filter((r) => !r.slug && !r.body)
      .map((r) => [r.title, r]),
  );

  const rows = leafletStories.map((story) => ({
    title: story.title,
    slug: story.slug,
    author: story.author,
    cover_image_url: coverUrl(story.image),
    body: story.body,
    status: story.draft ? ("draft" as const) : ("published" as const),
    publish_date: story.publishDate,
    story_type: story.type,
    featured: story.featured,
  }));

  const toInsert = rows.filter(
    (r) => !existingBySlug.has(r.slug) && !existingTitles.has(r.title),
  );
  const toUpdate = rows
    .filter((r) => !existingBySlug.has(r.slug) && existingEmptyDraftByTitle.has(r.title))
    .map((r) => ({
      id: existingEmptyDraftByTitle.get(r.title)!.id,
      row: r,
    }));
  const skipped = rows.length - toInsert.length - toUpdate.length;

  console.log(`Marketing-site stories: ${leafletStories.length}`);
  console.log(`Already imported (skipped): ${skipped}`);
  console.log(`To update in place (matched empty draft by title): ${toUpdate.length}`);
  console.log(`To insert: ${toInsert.length}\n`);

  for (const row of toInsert) {
    console.log(`- INSERT ${row.slug}  (${row.status})  ${row.title}`);
  }
  for (const { row } of toUpdate) {
    console.log(`- UPDATE ${row.slug}  (${row.status})  ${row.title}`);
  }

  if (dryRun) {
    console.log("\n--dry-run: no rows written.");
    return;
  }

  if (toInsert.length > 0) {
    let inserted = await supabase.from("stories").insert(toInsert).select("id");
    if (inserted.error && isMissingColumnError(inserted.error.message)) {
      inserted = await supabase
        .from("stories")
        .insert(toInsert.map(withoutMarketingFields))
        .select("id");
    }
    if (inserted.error) throw new Error(`Insert failed: ${inserted.error.message}`);
    console.log(`\nInserted ${inserted.data?.length ?? 0} stories.`);
  }

  for (const { id, row } of toUpdate) {
    let updateError = (await supabase.from("stories").update(row).eq("id", id)).error;
    if (updateError && isMissingColumnError(updateError.message)) {
      updateError = (await supabase.from("stories").update(withoutMarketingFields(row)).eq("id", id))
        .error;
    }
    if (updateError) throw new Error(`Update failed for ${row.slug}: ${updateError.message}`);
  }
  if (toUpdate.length > 0) {
    console.log(`Updated ${toUpdate.length} existing stor${toUpdate.length === 1 ? "y" : "ies"} in place.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

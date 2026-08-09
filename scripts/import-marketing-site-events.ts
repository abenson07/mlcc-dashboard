#!/usr/bin/env npx tsx
/**
 * Import the events actually shown on mapleleafcommunity.org/events into the
 * dashboard-native `events` table.
 *
 * The live /events page is server-rendered by this repo's marketing app
 * (`src/app/(marketing)/(skeleton)/events/page.tsx` -> CmsGrid12Section ->
 * `mlcc-website/data/events.ts`) — a hand-authored static array, NOT sourced
 * from either Webflow CMS "Events" collection. (An earlier pass at this
 * mistakenly imported from the Webflow "Events_olds" collection instead;
 * those 23 rows were removed before running this script.)
 *
 * Idempotent: de-dupes against existing rows by `slug`.
 *
 * Usage:
 *   npx tsx scripts/import-marketing-site-events.ts --dry-run
 *   npx tsx scripts/import-marketing-site-events.ts
 */

import { createClient } from "@supabase/supabase-js";
import { events } from "../mlcc-website/data/events";

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: existing, error: existingError } = await supabase
    .from("events")
    .select("id,slug,name,starts_at");
  if (existingError) throw new Error(`Failed to read existing events: ${existingError.message}`);
  const existingBySlug = new Map((existing ?? []).filter((r) => r.slug).map((r) => [r.slug, r]));
  // Fallback match for rows created by hand before this import (e.g. an empty
  // draft with no slug/starts_at yet) so we update it in place instead of
  // creating a duplicate with the same name.
  const existingByName = new Map(
    (existing ?? []).filter((r) => !r.slug && !r.starts_at).map((r) => [r.name, r])
  );

  const rows = events.map((e) => ({
    name: e.title,
    date: e.dateIso.slice(0, 10),
    starts_at: e.dateIso,
    ends_at: null,
    slug: e.slug,
    publish_status: "published" as const,
    field_data: {
      location: e.locationName,
      description: e.shortDescription,
      image_url: e.image,
      category: e.category,
      kind: e.external ? "external" : "council",
      external_event_url: e.external ? e.href : undefined,
      marketing_site_slug: e.slug,
      source: "marketing-site-static",
    },
  }));

  const toInsert = rows.filter((r) => !existingBySlug.has(r.slug) && !existingByName.has(r.name));
  const toUpdate = rows
    .filter((r) => !existingBySlug.has(r.slug) && existingByName.has(r.name))
    .map((r) => ({ id: existingByName.get(r.name)!.id, row: r }));
  const skipped = rows.length - toInsert.length - toUpdate.length;

  console.log(`Marketing-site events: ${events.length}`);
  console.log(`Already imported (skipped): ${skipped}`);
  console.log(`To update in place (matched empty draft by name): ${toUpdate.length}`);
  console.log(`To insert: ${toInsert.length}\n`);

  for (const row of toInsert) {
    console.log(`- INSERT ${row.name}  (${row.starts_at})  @ ${row.field_data.location}`);
  }
  for (const { row } of toUpdate) {
    console.log(`- UPDATE ${row.name}  (${row.starts_at})  @ ${row.field_data.location}`);
  }

  if (dryRun) {
    console.log("\n--dry-run: no rows written.");
    return;
  }

  if (toInsert.length > 0) {
    const { data: inserted, error: insertError } = await supabase
      .from("events")
      .insert(toInsert)
      .select("id,name");
    if (insertError) throw new Error(`Insert failed: ${insertError.message}`);
    console.log(`\nInserted ${inserted?.length ?? 0} events.`);
  }

  for (const { id, row } of toUpdate) {
    const { error: updateError } = await supabase.from("events").update(row).eq("id", id);
    if (updateError) throw new Error(`Update failed for ${row.name}: ${updateError.message}`);
  }
  if (toUpdate.length > 0) {
    console.log(`Updated ${toUpdate.length} existing draft(s) in place.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

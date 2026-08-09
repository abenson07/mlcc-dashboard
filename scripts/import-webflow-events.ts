#!/usr/bin/env npx tsx
/**
 * One-time backfill: import events currently live on mapleleafcommunity.org into
 * the dashboard-native `events` table (schemas/events.ts), using
 * `field_data.webflow_item_id` as the migration bridge to make reruns idempotent.
 *
 * The site's live /events page is bound to the "Events_olds" Webflow CMS collection
 * (id 67f510fc72e936f2b66ee05c) — NOT the newer "Events" collection that
 * WEBFLOW_EVENTS_COLLECTION_ID points to in .env.local. That newer collection only
 * has 11 items (mostly future Silent Book Club dates) and isn't what's rendering on
 * the live site today, so its id is intentionally hardcoded below rather than read
 * from env.
 *
 * Usage:
 *   npx tsx scripts/import-webflow-events.ts --dry-run
 *   npx tsx scripts/import-webflow-events.ts
 */

import { createClient } from "@supabase/supabase-js";

const LIVE_EVENTS_COLLECTION_ID = "67f510fc72e936f2b66ee05c"; // "Events_olds" — actually live on the site
const COMMITTEES_COLLECTION_ID = "67f50dc4c36502617609db91";

const WEBFLOW_API_BASE = "https://api.webflow.com/v2";

type WebflowItem = {
  id: string;
  isDraft?: boolean;
  isArchived?: boolean;
  fieldData: Record<string, unknown>;
};

async function wf<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${WEBFLOW_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Webflow ${path} -> ${res.status} ${res.statusText}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

async function listAllItems(token: string, collectionId: string): Promise<WebflowItem[]> {
  const all: WebflowItem[] = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const res = await wf<{ items: WebflowItem[]; pagination: { total: number } }>(
      token,
      `/collections/${collectionId}/items?offset=${offset}&limit=${limit}`
    );
    all.push(...(res.items ?? []));
    const total = res.pagination?.total ?? all.length;
    if (all.length >= total || (res.items ?? []).length < limit) break;
    offset += limit;
  }
  return all;
}

function htmlToPlainText(html: string | null | undefined): string | undefined {
  if (!html) return undefined;
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const token = process.env.WEBFLOW_SITE_API_TOKEN || process.env.WEBFLOW_API_TOKEN;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token) throw new Error("Missing WEBFLOW_SITE_API_TOKEN / WEBFLOW_API_TOKEN");
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Resolve committee Reference IDs -> display names.
  const committeeItems = await listAllItems(token, COMMITTEES_COLLECTION_ID);
  const committeeNameById = new Map<string, string>(
    committeeItems.map((c) => [c.id, String((c.fieldData as { name?: string }).name ?? "")])
  );

  // Resolve the `event-location` Option field's choice IDs -> labels.
  const collection = await wf<{
    fields: { slug: string; type: string; validations?: { options?: { id: string; name: string }[] } }[];
  }>(token, `/collections/${LIVE_EVENTS_COLLECTION_ID}`);
  const locationField = collection.fields.find((f) => f.slug === "event-location");
  const locationNameById = new Map<string, string>(
    (locationField?.validations?.options ?? []).map((o) => [o.id, o.name])
  );

  const items = await listAllItems(token, LIVE_EVENTS_COLLECTION_ID);
  const live = items.filter((i) => !i.isDraft && !i.isArchived);

  // Skip anything already imported (idempotent reruns).
  const { data: existing, error: existingError } = await supabase
    .from("events")
    .select("field_data");
  if (existingError) throw new Error(`Failed to read existing events: ${existingError.message}`);
  const alreadyImported = new Set(
    (existing ?? [])
      .map((r) => (r.field_data as Record<string, unknown> | null)?.webflow_item_id)
      .filter((id): id is string => typeof id === "string")
  );

  const toInsert = live
    .filter((item) => !alreadyImported.has(item.id))
    .map((item) => {
      const f = item.fieldData as Record<string, unknown>;
      const name = String(f.name ?? "Untitled event");
      const startsAt = (f["event-date-and-time"] as string | null) ?? null;
      const locationOptionId = f["event-location"] as string | null;
      const location =
        (locationOptionId ? locationNameById.get(locationOptionId) : null) ??
        (f["event-location-alternate"] as string | null) ??
        undefined;
      const committeeId = f["committee-sponsor"] as string | null;
      const committee = committeeId ? committeeNameById.get(committeeId) : undefined;
      const image = f["event-image"] as { url?: string } | null;

      return {
        name,
        date: startsAt ? startsAt.slice(0, 10) : null,
        starts_at: startsAt,
        ends_at: null,
        slug: (f.slug as string | null) ?? null,
        publish_status: "published" as const,
        field_data: {
          location,
          description: htmlToPlainText(f["event-description"] as string | null),
          short_description: (f["short-description"] as string | null) ?? undefined,
          image_url: image?.url,
          kind: "council" as const,
          committee,
          webflow_item_id: item.id,
          webflow_source_collection: "Events_olds",
        },
      };
    });

  console.log(`Webflow live items: ${live.length}`);
  console.log(`Already imported (skipped): ${live.length - toInsert.length}`);
  console.log(`To insert: ${toInsert.length}\n`);

  for (const row of toInsert) {
    console.log(`- ${row.name}  (${row.starts_at})  @ ${row.field_data.location ?? "no location"}`);
  }

  if (dryRun) {
    console.log("\n--dry-run: no rows written.");
    return;
  }

  if (toInsert.length === 0) {
    console.log("\nNothing to insert.");
    return;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("events")
    .insert(toInsert)
    .select("id,name");
  if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

  console.log(`\nInserted ${inserted?.length ?? 0} events.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env npx tsx
/**
 * Seed `public.businesses` from Google Places API (New) inside a geographic circle.
 *
 * Default area: Maple Leaf, Seattle (~47.7, -122.32), radius 1600 m.
 *
 * Why grid + text search: Nearby Search (New) returns at most 20 places per HTTP request
 * with no pagination. Text Search paginates but Google caps total rows per query (~60).
 * Combining several nearby centers plus several text queries improves coverage.
 *
 * Prerequisites:
 * - Run migration `supabase/migrations/20260509120000_businesses_places_outreach.sql`
 *   (Supabase Dashboard → SQL editor, or Supabase CLI).
 * - `.env.local`: GOOGLE_PLACES_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npm run seed:businesses -- --dry-run
 *   npm run seed:businesses
 *   npm run seed:businesses -- --emit-sql --out=supabase/seed_maple_leaf_places.sql
 *   npm run seed:businesses -- --nearby-only --lat=47.701 --lng=-122.318 --radius=1200
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  circleToViewportRectangle,
  placesSearchNearbyNew,
  placesSearchTextAllPages,
  type LatLng,
  type PlaceSeedRow,
} from "../src/lib/places/googlePlaces";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");

function parseEnvLine(line: string): { key: string; val: string } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) return null;
  const key = trimmed.slice(0, eq).trim();
  let val = trimmed.slice(eq + 1).trim();
  if (val.includes("#") && !(val.startsWith('"') || val.startsWith("'"))) {
    const hash = val.indexOf("#");
    if (hash > 0) val = val.slice(0, hash).trim();
  }
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
    let text = fs.readFileSync(p, "utf8");
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    for (const rawLine of text.split(/\r?\n/)) {
      const parsed = parseEnvLine(rawLine);
      if (!parsed) continue;
      if (process.env[parsed.key] === undefined || process.env[parsed.key] === "") {
        process.env[parsed.key] = parsed.val;
      }
    }
  }
}

function offsetMeters(center: LatLng, eastM: number, northM: number): LatLng {
  const latRad = (center.latitude * Math.PI) / 180;
  return {
    latitude: center.latitude + northM / 111320,
    longitude: center.longitude + eastM / (111320 * Math.cos(latRad || 1e-6)),
  };
}

/** Centers for repeated nearby search (each returns up to 20 places). */
function gridSampleCenters(center: LatLng, radiusMeters: number): LatLng[] {
  const out: LatLng[] = [center];
  const ringCounts = [6, 12];
  const radiusFractions = [0.42, 0.78];
  for (let ring = 0; ring < ringCounts.length; ring++) {
    const count = ringCounts[ring];
    const dist = radiusMeters * radiusFractions[ring];
    const angleOffset = ring === 1 ? Math.PI / count : 0;
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count + angleOffset;
      out.push(offsetMeters(center, Math.cos(angle) * dist, Math.sin(angle) * dist));
    }
  }
  return out;
}

const DEFAULT_CENTER: LatLng = { latitude: 47.7, longitude: -122.32 };
const DEFAULT_RADIUS_M = 1600;

const TEXT_QUERIES = [
  "business Maple Leaf Seattle WA",
  "restaurant Maple Leaf Seattle WA",
  "store Maple Leaf Seattle WA",
  "coffee shop Maple Leaf Seattle WA",
  "hair salon barber Maple Leaf Seattle WA",
  "professional services Maple Leaf Seattle WA",
];

function sqlLiteral(value: string): string {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
}

function sqlNullable(value: string): string {
  const t = value.trim();
  return t ? sqlLiteral(t) : "NULL";
}

async function main(): Promise<void> {
  loadEnvFiles();
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const nearbyOnly = argv.includes("--nearby-only");
  const emitSql = argv.includes("--emit-sql");
  const outArg = argv.find((a) => a.startsWith("--out="));

  const latArg = argv.find((a) => a.startsWith("--lat="));
  const lngArg = argv.find((a) => a.startsWith("--lng="));
  const rArg = argv.find((a) => a.startsWith("--radius="));
  const center: LatLng = {
    latitude: latArg ? Number(latArg.split("=")[1]) : DEFAULT_CENTER.latitude,
    longitude: lngArg ? Number(lngArg.split("=")[1]) : DEFAULT_CENTER.longitude,
  };
  const radiusMeters = rArg ? Number(rArg.split("=")[1]) : DEFAULT_RADIUS_M;

  if (!Number.isFinite(center.latitude) || !Number.isFinite(center.longitude) || !Number.isFinite(radiusMeters)) {
    console.error("Invalid --lat, --lng, or --radius");
    process.exit(1);
  }

  const rectangle = circleToViewportRectangle(center, radiusMeters);
  const merged = new Map<string, PlaceSeedRow>();

  console.log(`Collecting Places near (${center.latitude}, ${center.longitude}) r=${radiusMeters}m …`);

  const centers = gridSampleCenters(center, radiusMeters);
  for (let i = 0; i < centers.length; i++) {
    const c = centers[i]!;
    const rows = await placesSearchNearbyNew({
      circle: { center: c, radiusMeters },
      maxResultCount: 20,
      rankPreference: "POPULARITY",
      regionCode: "US",
    });
    for (const row of rows) merged.set(row.googlePlaceId, row);
    console.log(`  nearby grid ${i + 1}/${centers.length}: +${rows.length} (${merged.size} unique)`);
  }

  if (!nearbyOnly) {
    for (const query of TEXT_QUERIES) {
      const rows = await placesSearchTextAllPages({
        textQuery: query,
        locationRestriction: { rectangle },
        regionCode: "US",
        pageSize: 20,
        maxPages: 8,
      });
      const before = merged.size;
      for (const row of rows) merged.set(row.googlePlaceId, row);
      console.log(`  text "${query}": +${rows.length} raw, +${merged.size - before} unique (${merged.size} total)`);
    }
  }

  const rows = [...merged.values()];
  console.log(`\nTotal unique places: ${rows.length}`);

  if (emitSql) {
    const migrationPaths = [
      "supabase/migrations/20260509120000_businesses_places_outreach.sql",
      "supabase/migrations/20260509210000_business_hide_and_place_blocks.sql",
    ];
    const ddl = migrationPaths
      .map((rel) => fs.readFileSync(path.join(REPO_ROOT, rel), "utf8").trim())
      .join("\n\n");
    const defaultOut = path.join(REPO_ROOT, "supabase/seed_maple_leaf_places.sql");
    const outPath = outArg?.startsWith("--out=")
      ? path.isAbsolute(outArg.slice(6))
        ? outArg.slice(6)
        : path.join(REPO_ROOT, outArg.slice(6))
      : defaultOut;

    const valueLines = rows.map((r) => {
      const parts = [
        sqlLiteral(r.businessName),
        sqlNullable(r.formattedAddress),
        sqlNullable(r.nationalPhoneNumber),
        sqlNullable(r.websiteUri),
        sqlLiteral(r.googlePlaceId),
      ];
      return `    (${parts.join(", ")}, false)`;
    });

    const sql = `-- Generated by scripts/seed-businesses-from-places.ts --emit-sql
-- Maple Leaf default circle + text queries. Skips Place IDs already present on public.businesses.

BEGIN;

${ddl}

INSERT INTO public.businesses (business_name, address, phone, website, google_place_id, contacted)
SELECT v.business_name, v.address, v.phone, v.website, v.google_place_id, v.contacted
FROM (
VALUES
${valueLines.join(",\n")}
) AS v(business_name, address, phone, website, google_place_id, contacted)
WHERE NOT EXISTS (
  SELECT 1 FROM public.businesses b WHERE b.google_place_id = v.google_place_id
);

COMMIT;
`;

    fs.writeFileSync(outPath, sql, "utf8");
    console.log(`\nWrote ${path.relative(REPO_ROOT, outPath)} (${rows.length} rows; skips duplicates by google_place_id).`);
    return;
  }

  if (dryRun) {
    console.log("(dry-run — skipping Supabase)");
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or service role key (set SUPABASE_SERVICE_ROLE_KEY in .env.local — never use NEXT_PUBLIC_ for service_role)."
    );
    process.exit(1);
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() && process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    console.warn(
      "[warn] Using NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY — that exposes the service role to the browser bundle. Rename to SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_) and rotate the key in Supabase."
    );
  }

  const supabase = createClient(url, serviceKey);

  const { data: existingRows, error: exErr } = await supabase
    .from("businesses")
    .select("google_place_id")
    .not("google_place_id", "is", null);
  if (exErr) {
    console.error("Failed to read existing google_place_id:", exErr.message);
    process.exit(1);
  }

  const existing = new Set(
    (existingRows ?? [])
      .map((r: { google_place_id: string | null }) => r.google_place_id)
      .filter((id): id is string => Boolean(id))
  );

  const payload = rows
    .filter((r) => !existing.has(r.googlePlaceId))
    .map((r) => ({
      business_name: r.businessName,
      address: r.formattedAddress || null,
      phone: r.nationalPhoneNumber || null,
      website: r.websiteUri || null,
      google_place_id: r.googlePlaceId,
      contacted: false,
    }));

  console.log(`Inserting ${payload.length} new rows (${rows.length - payload.length} skipped — already in DB)…`);

  const BATCH = 80;
  for (let i = 0; i < payload.length; i += BATCH) {
    const batch = payload.slice(i, i + BATCH);
    const { error } = await supabase.from("businesses").insert(batch);
    if (error) {
      console.error(`Insert batch ${i}-${i + batch.length} failed:`, error.message);
      process.exit(1);
    }
  }

  console.log("Done.");
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});

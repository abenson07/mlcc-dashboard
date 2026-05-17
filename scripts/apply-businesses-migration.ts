#!/usr/bin/env npx tsx
/**
 * Applies businesses-related Postgres migrations (DDL).
 *
 * The Supabase JS client cannot run DDL. Use either:
 * - `DATABASE_URL` or `SUPABASE_DATABASE_URL` (full URI from Dashboard → Database → Connection string), or
 * - `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_DB_PASSWORD` (the database password, not the anon/service API keys).
 *
 * Usage: npm run migrate:businesses
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

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

function connectionString(): string {
  const direct =
    process.env.SUPABASE_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (direct) return direct;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const pw = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (!url || !pw) {
    throw new Error(
      "Set DATABASE_URL or SUPABASE_DATABASE_URL, or SUPABASE_DB_PASSWORD plus NEXT_PUBLIC_SUPABASE_URL. Use the Postgres password from Supabase Dashboard → Settings → Database (not the JWT API keys)."
    );
  }
  const host = new URL(url).hostname;
  const ref = host.split(".")[0];
  return `postgresql://postgres:${encodeURIComponent(pw)}@db.${ref}.supabase.co:5432/postgres`;
}

const MIGRATION_FILES = [
  "20260509120000_businesses_places_outreach.sql",
  "20260509210000_business_hide_and_place_blocks.sql",
  "20260517120000_business_member_sponsor_flags.sql",
];

async function main(): Promise<void> {
  loadEnvFiles();

  const client = new pg.Client({
    connectionString: connectionString(),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  for (const name of MIGRATION_FILES) {
    const migrationPath = path.join(REPO_ROOT, "supabase/migrations", name);
    const sql = fs.readFileSync(migrationPath, "utf8");
    await client.query(sql);
    console.log("Applied migration:", path.relative(REPO_ROOT, migrationPath));
  }

  await client.end();
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

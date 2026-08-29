#!/usr/bin/env npx tsx
/**
 * Applies stories marketing-field columns (slug, author_slug, story_type, featured).
 * Usage: npx tsx scripts/apply-stories-marketing-fields-migration.ts
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

function connectionString(): string {
  const direct =
    process.env.SUPABASE_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (direct) return direct;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const pw = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (!url || !pw) {
    throw new Error(
      "Set DATABASE_URL or SUPABASE_DATABASE_URL, or SUPABASE_DB_PASSWORD plus NEXT_PUBLIC_SUPABASE_URL.",
    );
  }
  const ref = new URL(url).hostname.split(".")[0];
  return `postgresql://postgres:${encodeURIComponent(pw)}@db.${ref}.supabase.co:5432/postgres`;
}

async function main(): Promise<void> {
  loadEnvFiles();

  const migrationPath = path.join(
    REPO_ROOT,
    "supabase/migrations/20260828120000_stories_marketing_fields.sql",
  );
  const sql = fs.readFileSync(migrationPath, "utf8");

  const client = new pg.Client({
    connectionString: connectionString(),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query(sql);

  const cols = await client.query(
    `select column_name from information_schema.columns
     where table_schema = 'public' and table_name = 'stories'
       and column_name in ('slug', 'author_slug', 'story_type', 'featured')
     order by column_name`,
  );
  await client.end();

  console.log(
    "stories marketing columns:",
    cols.rows.map((r: { column_name: string }) => r.column_name).join(", "),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

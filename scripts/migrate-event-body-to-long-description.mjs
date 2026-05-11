#!/usr/bin/env node
/**
 * Copy Events CMS plain-text "Body" into Rich text "Long description", then clear Body.
 * Skips items that already have non-empty Long description or empty Body.
 *
 * Env: WEBFLOW_SITE_API_TOKEN (or WEBFLOW_API_TOKEN), WEBFLOW_EVENTS_COLLECTION_ID, WEBFLOW_SITE_ID (for localized publish)
 * Optional: WEBFLOW_EVENTS_SKIP_PUBLISH=true, WEBFLOW_EVENT_BODY_SLUG, WEBFLOW_EVENT_LONG_DESCRIPTION_SLUG
 *
 *   node scripts/migrate-event-body-to-long-description.mjs --dry-run
 *   node scripts/migrate-event-body-to-long-description.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { eventSlugsFromEnv } from "./webflow-events-schema.mjs";
import { plainTextToEventRichTextHtml, richTextValueToPlain } from "./plain-to-rich-html.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");
const API = "https://api.webflow.com/v2";

function parseEnvLine(rawLine) {
  let line = rawLine.trim();
  if (!line || line.startsWith("#")) return null;
  if (line.toLowerCase().startsWith("export ")) line = line.slice(7).trim();
  const eq = line.indexOf("=");
  if (eq <= 0) return null;
  const key = line.slice(0, eq).trim();
  let val = line.slice(eq + 1).trim();
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

function loadEnvFiles() {
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

async function wf(token, pathname, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(body != null ? { "Content-Type": "application/json" } : {}),
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg =
      json && typeof json === "object" && "message" in json ? String(json.message) : text || res.statusText;
    throw new Error(`Webflow ${method} ${pathname} → ${res.status}: ${msg}`);
  }
  return json;
}

async function listAllItems(token, collectionId) {
  const all = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const res = await wf(
      token,
      `/collections/${collectionId}/items?offset=${offset}&limit=${limit}`,
      { method: "GET" }
    );
    const batch = res.items ?? [];
    all.push(...batch);
    const total = res.pagination?.total ?? all.length;
    if (all.length >= total || batch.length < limit) break;
    offset += limit;
  }
  return all;
}

function mergeSiteLocaleIds(site) {
  const ids = [];
  const p = site?.locales?.primary?.cmsLocaleId;
  if (p) ids.push(p);
  for (const s of site?.locales?.secondary ?? []) {
    const id = s?.cmsLocaleId;
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

async function getSiteCmsLocaleIds(token, siteId) {
  try {
    const site = await wf(token, `/sites/${encodeURIComponent(siteId)}`, { method: "GET" });
    return mergeSiteLocaleIds(site);
  } catch {
    return [];
  }
}

async function publishCollectionItemIds(token, collectionId, itemIds) {
  if (itemIds.length === 0) return;
  const siteIdForLocales = process.env.WEBFLOW_SITE_ID?.trim() || "";
  let cmsLocaleIds = siteIdForLocales ? await getSiteCmsLocaleIds(token, siteIdForLocales) : [];
  const body =
    cmsLocaleIds.length > 0
      ? { items: itemIds.map((id) => ({ id, cmsLocaleIds })) }
      : { itemIds };
  await wf(token, `/collections/${collectionId}/items/publish`, {
    method: "POST",
    body,
  });
}

function bodyFieldPlain(raw) {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  return String(raw).trim();
}

async function main() {
  loadEnvFiles();
  const dryRun = process.argv.includes("--dry-run");

  const token = (
    process.env.WEBFLOW_SITE_API_TOKEN ||
    process.env.WEBFLOW_API_TOKEN ||
    ""
  ).trim();
  const collectionId = process.env.WEBFLOW_EVENTS_COLLECTION_ID?.trim() || "";

  if (!token || !collectionId) {
    console.error("Set WEBFLOW_SITE_API_TOKEN (or WEBFLOW_API_TOKEN) and WEBFLOW_EVENTS_COLLECTION_ID.");
    process.exit(1);
  }

  const slugs = eventSlugsFromEnv();
  const bodySlug = slugs.body;
  const longSlug = slugs.longDescription;

  const collection = await wf(token, `/collections/${collectionId}`);
  const schemaSlugs = new Set((collection.fields ?? []).map((f) => f.slug));

  if (!schemaSlugs.has(longSlug)) {
    console.error(`Collection has no "${longSlug}" field. Add Long description or set WEBFLOW_EVENT_LONG_DESCRIPTION_SLUG.`);
    process.exit(1);
  }
  if (!schemaSlugs.has(bodySlug)) {
    console.error(`Collection has no "${bodySlug}" field.`);
    process.exit(1);
  }

  const items = await listAllItems(token, collectionId);
  const migrated = [];

  for (const it of items) {
    if (it.isArchived) continue;
    const fd = it.fieldData ?? {};
    const bodyPlain = bodyFieldPlain(fd[bodySlug]);
    const longAlready = richTextValueToPlain(fd[longSlug]).trim();

    if (!bodyPlain) continue;
    if (longAlready) continue;

    const html = plainTextToEventRichTextHtml(bodyPlain);
    if (!html) continue;

    if (dryRun) {
      console.log(`[dry-run] ${it.id} — ${fd.name ?? "(no name)"}`);
      migrated.push(it.id);
      continue;
    }

    await wf(token, `/collections/${collectionId}/items/${encodeURIComponent(it.id)}`, {
      method: "PATCH",
      body: {
        isDraft: false,
        fieldData: {
          [longSlug]: html,
          [bodySlug]: null,
        },
      },
    });
    migrated.push(it.id);
    console.log(`Migrated → ${fd.name ?? it.id} (${it.id})`);
  }

  console.log(`\nDone. ${dryRun ? "Would migrate" : "Migrated"} ${migrated.length} item(s).`);

  if (dryRun || migrated.length === 0 || process.env.WEBFLOW_EVENTS_SKIP_PUBLISH === "true") {
    return;
  }

  try {
    await publishCollectionItemIds(token, collectionId, migrated);
    console.log(`Published ${migrated.length} item(s).`);
  } catch (e) {
    console.warn("Publish failed (CMS updated):", e.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

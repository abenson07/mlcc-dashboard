#!/usr/bin/env node
/**
 * Upload the Silent Book Club header art to Webflow assets and set Featured image
 * on every Events CMS item whose name matches /Silent Book Club/i.
 *
 * Env: WEBFLOW_SITE_API_TOKEN (or WEBFLOW_API_TOKEN), WEBFLOW_SITE_ID, WEBFLOW_EVENTS_COLLECTION_ID
 * Optional: SILENT_BOOK_FEATURED_IMAGE_PATH (defaults to scripts/assets/silent-book-club-featured.png)
 * Optional: WEBFLOW_EVENTS_SKIP_PUBLISH=true
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { eventSlugsFromEnv } from "./webflow-events-schema.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");
const API = "https://api.webflow.com/v2";
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/svg+xml",
  "image/webp",
  "image/avif",
]);

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

function normalizeMime(mime) {
  const m = mime.split(";")[0]?.trim().toLowerCase() ?? "";
  return m === "image/jpg" ? "image/jpeg" : m;
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

async function uploadSiteImageAsset(token, siteId, fileBuffer, fileName, mimeType) {
  const mime = normalizeMime(mimeType);
  if (!ALLOWED_MIME.has(mime)) {
    throw new Error(`Unsupported image type (${mimeType || "unknown"}).`);
  }
  if (fileBuffer.length > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 4MB or smaller.");
  }

  const safeName =
    fileName.replace(/[^\w.\-]+/g, "_").slice(0, 99) ||
    `upload.${mime === "image/svg+xml" ? "svg" : "png"}`;

  const fileHash = crypto.createHash("md5").update(fileBuffer).digest("hex");

  const created = await wf(token, `/sites/${encodeURIComponent(siteId)}/assets`, {
    method: "POST",
    body: { fileName: safeName, fileHash },
  });

  const urlEarly = created.hostedUrl ?? created.assetUrl;
  if (urlEarly && !created.uploadUrl) {
    return { url: urlEarly, fileId: created.id };
  }

  if (!created.uploadUrl || !created.uploadDetails) {
    throw new Error("Webflow did not return upload instructions for this asset.");
  }

  const fd = new FormData();
  for (const [k, v] of Object.entries(created.uploadDetails)) {
    if (v == null || v === "") continue;
    fd.append(k, String(v));
  }
  const blob = new Blob([new Uint8Array(fileBuffer)], { type: mime });
  fd.append("file", blob, safeName);

  const up = await fetch(created.uploadUrl, { method: "POST", body: fd });
  if (!up.ok) {
    const t = await up.text();
    throw new Error(`Storage upload failed (${up.status}). ${t.slice(0, 200)}`);
  }

  const url = created.hostedUrl ?? created.assetUrl;
  if (!url) {
    throw new Error("Webflow did not return a hosted URL for the new asset.");
  }
  return { url, fileId: created.id };
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

function isSilentBookClubItem(fieldData, nameSlug) {
  const name = String(fieldData?.[nameSlug] ?? fieldData?.name ?? "").trim();
  return /silent book club/i.test(name);
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

async function main() {
  loadEnvFiles();
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");

  const token = (
    process.env.WEBFLOW_SITE_API_TOKEN ||
    process.env.WEBFLOW_API_TOKEN ||
    ""
  ).trim();
  const collectionId = process.env.WEBFLOW_EVENTS_COLLECTION_ID?.trim() || "";
  const siteId = process.env.WEBFLOW_SITE_ID?.trim() || "";

  if (!token || !collectionId) {
    console.error("Set WEBFLOW_SITE_API_TOKEN (or WEBFLOW_API_TOKEN) and WEBFLOW_EVENTS_COLLECTION_ID.");
    process.exit(1);
  }
  if (!siteId) {
    console.error("Set WEBFLOW_SITE_ID (required to upload assets).");
    process.exit(1);
  }

  const imagePath =
    process.env.SILENT_BOOK_FEATURED_IMAGE_PATH?.trim() ||
    path.join(__dirname, "assets", "silent-book-club-featured.png");

  if (!fs.existsSync(imagePath)) {
    console.error(`Image not found: ${imagePath}`);
    process.exit(1);
  }

  const buf = fs.readFileSync(imagePath);
  const slugs = eventSlugsFromEnv();
  const nameSlug = process.env.WEBFLOW_EVENT_FIELD_NAME_SLUG?.trim() || "name";

  const items = await listAllItems(token, collectionId);
  const targets = items.filter((it) => isSilentBookClubItem(it.fieldData ?? {}, nameSlug));

  if (targets.length === 0) {
    console.warn("No items matched *Silent Book Club* in the name field.");
    process.exit(0);
  }

  console.log(`Matched ${targets.length} Silent Book Club event(s).`);

  if (dryRun) {
    for (const it of targets) {
      const n = it.fieldData?.[nameSlug] ?? it.fieldData?.name;
      console.log(`  [dry-run] ${it.id} — ${n}`);
    }
    console.log("\nRe-run without --dry-run after upload (image path above).");
    return;
  }

  const { url } = await uploadSiteImageAsset(
    token,
    siteId,
    buf,
    "silent-book-club-featured.png",
    "image/png"
  );
  console.log(`Uploaded asset → ${url.slice(0, 80)}…`);

  const updated = [];
  for (const it of targets) {
    const itemId = it.id;
    const name = it.fieldData?.[nameSlug] ?? it.fieldData?.name;
    await wf(token, `/collections/${collectionId}/items/${encodeURIComponent(itemId)}`, {
      method: "PATCH",
      body: {
        isDraft: false,
        fieldData: {
          [slugs.featuredImage]: { url },
        },
      },
    });
    updated.push(itemId);
    console.log(`Updated featured image → ${name} (${itemId})`);
  }

  if (updated.length === 0 || process.env.WEBFLOW_EVENTS_SKIP_PUBLISH === "true") {
    console.log("Skip publish (WEBFLOW_EVENTS_SKIP_PUBLISH=true or no updates).");
    return;
  }

  try {
    await publishCollectionItemIds(token, collectionId, updated);
    console.log(`\nPublished ${updated.length} item(s).`);
  } catch (e) {
    console.warn("\nPublish failed (images are saved in CMS):", e.message);
    console.warn("Publish from Webflow Designer if needed.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

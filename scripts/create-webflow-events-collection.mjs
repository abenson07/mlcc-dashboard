#!/usr/bin/env node
/**
 * Creates a **new** Webflow CMS collection for the MLCC dashboard:
 *   display name: Events | singular: Event | slug: events (override with flags)
 *   All custom fields in one POST (same shapes as webflow-events-schema.mjs).
 *
 * Requires: WEBFLOW_SITE_API_TOKEN (or WEBFLOW_API_TOKEN), WEBFLOW_SITE_ID
 * Optional: WEBFLOW_COMMITTEES_COLLECTION_ID (adds Reference field "Committee")
 *
 * Usage:
 *   npm run webflow:create-events-collection
 *   npm run webflow:create-events-collection -- --collection-slug events-v2
 *
 * After success, set WEBFLOW_EVENTS_COLLECTION_ID in .env.local to the printed id,
 * then: npm run webflow:verify-events
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  EVENT_COLLECTION_DEFAULTS,
  eventSlugsFromEnv,
  expandBlueprint,
  fieldsForCollectionCreate,
  verifyMapping,
} from "./webflow-events-schema.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");
const API = "https://api.webflow.com/v2";

function parseEnvLine(rawLine) {
  let line = rawLine.trim();
  if (!line || line.startsWith("#")) return null;
  if (line.toLowerCase().startsWith("export ")) {
    line = line.slice(7).trim();
  }
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
    if (text.charCodeAt(0) === 0xfeff) {
      text = text.slice(1);
    }
    for (const rawLine of text.split(/\r?\n/)) {
      const parsed = parseEnvLine(rawLine);
      if (!parsed) continue;
      const { key, val } = parsed;
      if (process.env[key] === undefined || process.env[key] === "") {
        process.env[key] = val;
      }
    }
  }
}

function getResolvedWebflowToken() {
  return (
    process.env.WEBFLOW_SITE_API_TOKEN ||
    process.env.WEBFLOW_API_TOKEN ||
    ""
  ).trim();
}

function argValue(argv, name) {
  const i = argv.indexOf(name);
  if (i >= 0) return argv[i + 1]?.trim() ?? "";
  return "";
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
      json && typeof json === "object" && "message" in json
        ? String(json.message)
        : text || res.statusText;
    const err = new Error(`Webflow ${method} ${pathname} → ${res.status}: ${msg}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

async function listCollections(token, siteId) {
  const data = await wf(token, `/sites/${siteId}/collections`);
  return data.collections ?? [];
}

async function main() {
  loadEnvFiles();
  const argv = process.argv.slice(2);

  const token = getResolvedWebflowToken();
  if (!token) {
    console.error("Set WEBFLOW_SITE_API_TOKEN or WEBFLOW_API_TOKEN.");
    process.exit(1);
  }

  const siteId = process.env.WEBFLOW_SITE_ID?.trim() || argValue(argv, "--site-id");
  if (!siteId) {
    console.error("Set WEBFLOW_SITE_ID (or pass --site-id <id>).");
    console.error("Find it via: npm run webflow:list-sites");
    process.exit(1);
  }

  const displayName =
    argValue(argv, "--display-name") || EVENT_COLLECTION_DEFAULTS.displayName;
  const singularName =
    argValue(argv, "--singular-name") || EVENT_COLLECTION_DEFAULTS.singularName;
  const collectionSlug =
    argValue(argv, "--collection-slug") || EVENT_COLLECTION_DEFAULTS.slug;

  const committeesId = process.env.WEBFLOW_COMMITTEES_COLLECTION_ID?.trim() || "";
  if (!committeesId) {
    console.warn(
      'WARN: WEBFLOW_COMMITTEES_COLLECTION_ID not set — new collection will not include the "Committee" Reference field.\n'
    );
  }

  const collections = await listCollections(token, siteId);
  const nameClash = collections.find(
    (c) =>
      c.displayName?.trim() === displayName.trim() ||
      c.slug?.trim() === collectionSlug.trim()
  );
  if (nameClash) {
    console.error(
      `Refusing to create: site already has a collection with this name or slug:\n` +
        `  displayName: "${nameClash.displayName}"  slug: "${nameClash.slug}"  id: ${nameClash.id}\n` +
        `Rename/delete it in Webflow Designer or use e.g. --collection-slug events-v2`
    );
    process.exit(1);
  }

  const payload = {
    displayName,
    singularName,
    slug: collectionSlug,
    fields: fieldsForCollectionCreate(committeesId),
  };

  console.log(
    `Creating collection "${displayName}" (/${collectionSlug}/) on site ${siteId}…`
  );
  const created = await wf(token, `/sites/${siteId}/collections`, {
    method: "POST",
    body: payload,
  });

  const id = created.id;
  if (!id) {
    console.error("Unexpected response (no id):", JSON.stringify(created, null, 2));
    process.exit(1);
  }

  const detail = await wf(token, `/collections/${id}`);
  const slugs = eventSlugsFromEnv();
  const specs = expandBlueprint(slugs, committeesId);
  const issues = verifyMapping(detail, specs);

  console.log("\nCreated successfully.");
  console.log(`WEBFLOW_EVENTS_COLLECTION_ID=${id}`);
  console.log(`Collection slug in CMS: ${detail.slug ?? collectionSlug}`);
  console.log("\nAdd WEBFLOW_EVENTS_COLLECTION_ID to .env.local, restart next dev, then:");
  console.log("  npm run webflow:verify-events");
  console.log("\nIn Webflow Designer: bind Collection Lists / templates to this new collection, then Publish.");

  if (issues.length) {
    console.error(
      "\nSlug/type verification had issues (unexpected after create):\n",
      issues.map((i) => `  - ${i}`).join("\n")
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  if (e.body) console.error(JSON.stringify(e.body, null, 2));
  process.exit(1);
});

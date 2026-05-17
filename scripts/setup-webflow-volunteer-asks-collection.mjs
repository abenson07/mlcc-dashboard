#!/usr/bin/env node
/**
 * Creates the Webflow CMS collection "Volunteer Asks" for the public site.
 * Synced from Supabase via POST /api/webhooks/supabase/volunteer-asks
 *
 * Usage:
 *   npm run webflow:setup-volunteer-asks
 *   npm run webflow:setup-volunteer-asks -- --list-sites
 *   npm run webflow:verify-volunteer-asks
 *
 * After success, add to .env.local:
 *   WEBFLOW_VOLUNTEER_ASKS_COLLECTION_ID=<printed id>
 *   SUPABASE_VOLUNTEER_ASK_WEBHOOK_SECRET=<random secret for Supabase Database Webhook>
 *
 * Supabase → Database → Webhooks → volunteer_asks + volunteers tables:
 *   URL: https://<your-dashboard-host>/api/webhooks/supabase/volunteer-asks
 *   Header: x-volunteer-ask-webhook-secret: <same secret>
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");
const API = "https://api.webflow.com/v2";

const COLLECTION_DISPLAY = "Volunteer Asks";
const COLLECTION_SINGULAR = "Volunteer Ask";
const COLLECTION_SLUG = "volunteer-asks";

const FIELD_SPECS = [
  {
    type: "PlainText",
    displayName: "Supabase ask id",
    isRequired: true,
    helpText: "UUID from Supabase volunteer_asks — used by the dashboard sync.",
  },
  {
    type: "PlainText",
    displayName: "Description",
    isRequired: false,
    helpText: "What volunteers will be doing.",
  },
  {
    type: "PlainText",
    displayName: "Commitment type",
    isRequired: false,
    helpText: "One-off or Ongoing (display label).",
  },
  {
    type: "PlainText",
    displayName: "Commitment unit",
    isRequired: false,
    helpText: "hours or minutes.",
  },
  {
    type: "Number",
    displayName: "Commitment quantity",
    isRequired: false,
    helpText: "Time amount per volunteer.",
  },
  {
    type: "PlainText",
    displayName: "Commitment summary",
    isRequired: false,
    helpText: "Human-readable time commitment (e.g. 3 hours / month).",
  },
  {
    type: "Number",
    displayName: "Quantity needed",
    isRequired: false,
    helpText: "How many volunteers are needed.",
  },
  {
    type: "Number",
    displayName: "Signed up",
    isRequired: false,
    helpText: "Current signup count (synced from dashboard).",
  },
  {
    type: "Number",
    displayName: "Remaining",
    isRequired: false,
    helpText: "Open slots remaining.",
  },
  {
    type: "PlainText",
    displayName: "Event name",
    isRequired: false,
    helpText: "Linked event label for filtering on the site.",
  },
];

const REQUIRED_CUSTOM_SLUGS = [
  "supabase-ask-id",
  "description",
  "commitment-type",
  "commitment-unit",
  "commitment-quantity",
  "commitment-summary",
  "quantity-needed",
  "signed-up",
  "remaining",
  "event-name",
];

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

async function printSites(token) {
  const data = await wf(token, "/sites");
  const sites = Array.isArray(data) ? data : (data.sites ?? []);
  for (const s of sites) {
    console.log(`  id: ${s.id}`);
    console.log(`  displayName: ${s.displayName ?? s.shortName ?? "(unnamed)"}\n`);
  }
  console.log("Set WEBFLOW_SITE_ID, then run without --list-sites.");
}

async function listCollections(token, siteId) {
  const data = await wf(token, `/sites/${siteId}/collections`);
  return data.collections ?? [];
}

async function findExisting(token, siteId) {
  const cols = await listCollections(token, siteId);
  return (
    cols.find(
      (c) =>
        c.displayName === COLLECTION_DISPLAY ||
        c.slug === COLLECTION_SLUG ||
        c.displayName?.toLowerCase() === COLLECTION_DISPLAY.toLowerCase()
    ) ?? null
  );
}

function verifyFieldSlugs(collection) {
  const fields = collection.fields ?? [];
  const customSlugs = fields
    .map((f) => f.slug)
    .filter((slug) => slug && slug !== "name" && slug !== "slug");
  const missing = REQUIRED_CUSTOM_SLUGS.filter((s) => !customSlugs.includes(s));
  return { customSlugs, missing };
}

async function main() {
  loadEnvFiles();
  const argv = process.argv.slice(2);
  const token = getResolvedWebflowToken();
  if (!token) {
    console.error("Missing WEBFLOW_SITE_API_TOKEN or WEBFLOW_API_TOKEN.");
    process.exit(1);
  }

  if (argv.includes("--list-sites")) {
    await printSites(token);
    return;
  }

  if (argv.includes("--verify")) {
    const collectionId = process.env.WEBFLOW_VOLUNTEER_ASKS_COLLECTION_ID?.trim();
    if (!collectionId) {
      console.error("Missing WEBFLOW_VOLUNTEER_ASKS_COLLECTION_ID.");
      process.exit(1);
    }
    const detail = await wf(token, `/collections/${collectionId}`);
    const { customSlugs, missing } = verifyFieldSlugs(detail);
    console.log(`Collection: ${detail.displayName} (${detail.id})`);
    console.log("Slugs:", customSlugs.join(", "));
    if (missing.length) {
      console.error("Missing slugs:", missing.join(", "));
      process.exit(1);
    }
    console.log("OK — volunteer ask fields present.");
    return;
  }

  const siteId = process.env.WEBFLOW_SITE_ID?.trim();
  if (!siteId) {
    console.error("Missing WEBFLOW_SITE_ID. Run with --list-sites first.");
    process.exit(1);
  }

  const existing = await findExisting(token, siteId);
  if (existing) {
    console.log(`Collection already exists: "${existing.displayName}"`);
    console.log(`WEBFLOW_VOLUNTEER_ASKS_COLLECTION_ID=${existing.id}`);
    const detail = await wf(token, `/collections/${existing.id}`);
    const { missing } = verifyFieldSlugs(detail);
    if (missing.length) {
      console.warn("Missing field slugs:", missing.join(", "));
    }
    return;
  }

  const payload = {
    displayName: COLLECTION_DISPLAY,
    singularName: COLLECTION_SINGULAR,
    slug: COLLECTION_SLUG,
    fields: FIELD_SPECS.map((f) => ({
      type: f.type,
      displayName: f.displayName,
      isRequired: f.isRequired,
      ...(f.helpText ? { helpText: f.helpText } : {}),
    })),
  };

  console.log(`Creating "${COLLECTION_DISPLAY}" on site ${siteId}…`);
  const created = await wf(token, `/sites/${siteId}/collections`, {
    method: "POST",
    body: payload,
  });

  console.log("\nCreated successfully.");
  console.log(`WEBFLOW_VOLUNTEER_ASKS_COLLECTION_ID=${created.id}`);
  const detail = await wf(token, `/collections/${created.id}`);
  const { customSlugs, missing } = verifyFieldSlugs(detail);
  console.log("Field slugs:", customSlugs.join(", "));
  if (missing.length) console.warn("Unexpected missing:", missing.join(", "));
  console.log(
    "\nNext: set WEBFLOW_VOLUNTEER_ASKS_COLLECTION_ID and SUPABASE_VOLUNTEER_ASK_WEBHOOK_SECRET in .env.local,"
  );
  console.log(
    "then add a Supabase Database Webhook for volunteer_asks + volunteers → /api/webhooks/supabase/volunteer-asks"
  );
}

main().catch((e) => {
  console.error(e.message || e);
  if (e.body) console.error(JSON.stringify(e.body, null, 2));
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Creates missing custom fields on an *existing* Events Webflow collection.
 *
 * Usage:
 *   npm run webflow:verify-events
 *   npm run webflow:setup-events-fields
 *
 * For a brand-new collection named "Events", use: npm run webflow:create-events-collection
 *
 * Env: WEBFLOW_SITE_API_TOKEN (or WEBFLOW_API_TOKEN), WEBFLOW_EVENTS_COLLECTION_ID,
 * optional WEBFLOW_COMMITTEES_COLLECTION_ID for the committee Reference field.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  eventSlugsFromEnv,
  expandBlueprint,
  normalizeFields,
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  loadEnvFiles();
  const argv = process.argv.slice(2);
  const verifyOnly = argv.includes("--verify");

  const token = getResolvedWebflowToken();
  if (!token) {
    console.error("Set WEBFLOW_SITE_API_TOKEN or WEBFLOW_API_TOKEN.");
    process.exit(1);
  }

  const collectionId = process.env.WEBFLOW_EVENTS_COLLECTION_ID?.trim();
  if (!collectionId) {
    console.error("Set WEBFLOW_EVENTS_COLLECTION_ID to your Events CMS collection id.");
    process.exit(1);
  }

  const committeesId = process.env.WEBFLOW_COMMITTEES_COLLECTION_ID?.trim() || "";
  const slugs = eventSlugsFromEnv();
  const specs = expandBlueprint(slugs, committeesId);

  const detail = await wf(token, `/collections/${collectionId}`);

  if (verifyOnly) {
    console.log(
      `Verifying "${detail.displayName}" (${detail.slug})\nid: ${detail.id}\n`
    );
    console.log("Resolved slugs from env:\n", JSON.stringify(slugs, null, 2));
    const issues = verifyMapping(detail, specs);
    if (issues.length) {
      console.error("Issues:\n", issues.map((i) => `  - ${i}`).join("\n"));
      process.exit(1);
    }
    if (!committeesId) {
      console.warn(
        'Note: WEBFLOW_COMMITTEES_COLLECTION_ID not set — "committee" field was not part of this check.'
      );
    }
    console.log("OK — events collection matches dashboard field slugs and types.");
    process.exit(0);
  }

  console.log(
    `Ensuring custom fields on "${detail.displayName}" (${detail.slug})…\n`
  );

  if (!committeesId) {
    console.warn(
      "WARN: WEBFLOW_COMMITTEES_COLLECTION_ID not set — skipping committee Reference field.\n"
    );
  }

  let fields = normalizeFields(detail.fields ?? []);
  let created = 0;

  for (const spec of specs) {
    const targetSlug = spec.expectedSlug;
    const exists = fields.some((f) => f.slug === targetSlug);
    if (exists) {
      console.log(`• ${targetSlug} — already present`);
      continue;
    }

    const body = {
      type: spec.type,
      displayName: spec.displayName,
      isRequired: spec.isRequired ?? false,
      ...(spec.helpText ? { helpText: spec.helpText } : {}),
      ...(spec.metadata ? { metadata: spec.metadata } : {}),
    };

    console.log(`• Creating "${spec.displayName}" → expect slug "${targetSlug}" …`);
    const res = await wf(token, `/collections/${collectionId}/fields`, {
      method: "POST",
      body,
    });
    const returnedSlug =
      res && typeof res === "object" && "slug" in res && typeof res.slug === "string"
        ? res.slug
        : null;

    if (returnedSlug && returnedSlug !== targetSlug) {
      console.error(
        `\nERROR: Webflow created slug "${returnedSlug}" but dashboard expects "${targetSlug}".\n` +
          `Rename the field in Webflow Designer or set the matching WEBFLOW_EVENT_* env override.\n`
      );
      process.exit(1);
    }

    created += 1;
    await sleep(250);
    const refreshed = await wf(token, `/collections/${collectionId}`);
    fields = normalizeFields(refreshed.fields ?? []);
    const again = fields.find((f) => f.slug === targetSlug);
    if (!again) {
      const byName = fields.find(
        (f) => f.displayName?.trim() === spec.displayName.trim()
      );
      if (byName && byName.slug !== targetSlug) {
        console.error(
          `\nERROR: Field "${spec.displayName}" has slug "${byName.slug}"; expected "${targetSlug}".\n` +
            `Fix display name in this script or align WEBFLOW_EVENT_* / Designer.\n`
        );
        process.exit(1);
      }
    }
  }

  console.log(
    `\nDone. ${created} field(s) created. Open Webflow → CMS → your Events collection to confirm, then Publish.`
  );
  console.log(`Run: npm run webflow:verify-events`);
}

main().catch((e) => {
  console.error(e.message || e);
  if (e.body) console.error(JSON.stringify(e.body, null, 2));
  process.exit(1);
});

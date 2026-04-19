#!/usr/bin/env node
/**
 * Creates the Webflow CMS collection the MLCC dashboard expects for banners
 * (field slugs: message, link-url, active, expires-at, urgent, urgent-until, editor-notes).
 *
 * Usage:
 *   node scripts/setup-webflow-banners-collection.mjs --list-sites
 *   node scripts/setup-webflow-banners-collection.mjs --verify
 *   WEBFLOW_SITE_API_TOKEN=... WEBFLOW_SITE_ID=... node scripts/setup-webflow-banners-collection.mjs
 *
 * Or put WEBFLOW_SITE_API_TOKEN (or WEBFLOW_API_TOKEN) and WEBFLOW_SITE_ID in .env.local (script loads .env.local then .env).
 *
 * After success, add to .env.local:
 *   WEBFLOW_BANNERS_COLLECTION_ID=<printed id>
 *
 * Requires token scopes: sites:read (for --list-sites), cms:read, cms:write.
 * --verify needs cms:read + WEBFLOW_BANNERS_COLLECTION_ID (checks field slugs/types vs app defaults / env overrides).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");
const API = "https://api.webflow.com/v2";

const COLLECTION_DISPLAY = "Site banners";
const COLLECTION_SINGULAR = "Site banner";
const COLLECTION_SLUG = "site-banners";

/** Display names chosen so Webflow slugifies to the slugs in src/lib/webflow/field-slugs.ts */
const FIELD_SPECS = [
  {
    type: "PlainText",
    displayName: "Message",
    isRequired: true,
    helpText: "Text shown in the banner on the public site.",
  },
  {
    type: "PlainText",
    displayName: "Link URL",
    isRequired: false,
    helpText: "Optional URL when visitors click the banner.",
  },
  {
    type: "Switch",
    displayName: "Active",
    isRequired: false,
    helpText: "Off = hide this banner on the site.",
  },
  {
    type: "DateTime",
    displayName: "Expires at",
    isRequired: true,
    helpText: "When this banner stops showing. Urgent-until must be on or before this time.",
  },
  {
    type: "Switch",
    displayName: "Urgent",
    isRequired: false,
    helpText: "Only one banner should be urgent at a time. The dashboard enforces this.",
  },
  {
    type: "DateTime",
    displayName: "Urgent until",
    isRequired: false,
    helpText: "End of the urgent window (must be ≤ Expires at).",
  },
  {
    type: "PlainText",
    displayName: "Editor notes",
    isRequired: false,
    helpText: "Internal notes for board members (e.g. how the live site treats urgent after this date).",
  },
];

const REQUIRED_CUSTOM_SLUGS = [
  "message",
  "link-url",
  "active",
  "expires-at",
  "urgent",
  "urgent-until",
  "editor-notes",
];

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

function diagnoseMissingWebflowToken() {
  console.error("\nDiagnostics (paths relative to repo root):");
  for (const name of [".env.local", ".env"]) {
    const p = path.join(REPO_ROOT, name);
    const exists = fs.existsSync(p);
    console.error(`  ${name}: ${exists ? "found" : "not found"} (${p})`);
    if (!exists) continue;
    let text = fs.readFileSync(p, "utf8");
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    const hasSite = /^[\s]*(export\s+)?WEBFLOW_SITE_API_TOKEN\s*=/im.test(text);
    const hasApi = /^[\s]*(export\s+)?WEBFLOW_API_TOKEN\s*=/im.test(text);
    if (hasSite || hasApi) {
      console.error(
        "    (file declares WEBFLOW_SITE_API_TOKEN or WEBFLOW_API_TOKEN — if still failing, the value may be empty or malformed.)"
      );
    }
    const lines = text.split(/\r?\n/);
    for (const raw of lines) {
      const beforeComment = raw.split("#")[0] ?? "";
      if (!/webflow/i.test(beforeComment) || !/=/i.test(beforeComment)) continue;
      const parsed = parseEnvLine(beforeComment);
      if (!parsed) continue;
      if (
        parsed.key === "WEBFLOW_API_TOKEN" ||
        parsed.key === "WEBFLOW_SITE_API_TOKEN"
      ) {
        continue;
      }
      if (!/^WEBFLOW_/i.test(parsed.key)) continue;
      if (/TOKEN|API|KEY/i.test(parsed.key)) {
        console.error(
          `    Unrecognized token variable "${parsed.key}" — use WEBFLOW_SITE_API_TOKEN or WEBFLOW_API_TOKEN.`
        );
      }
    }
  }
  console.error(
    "\nFix: add a non-empty line to .env.local in the repo root (either name works):\n  WEBFLOW_SITE_API_TOKEN=your_token\n  # or: WEBFLOW_API_TOKEN=your_token\n"
  );
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

function printSites(token) {
  return wf(token, "/sites").then((data) => {
    const sites = Array.isArray(data) ? data : (data.sites ?? []);
    const list = Array.isArray(sites) ? sites : [];
    if (list.length === 0) {
      console.log("No sites returned. Check token scopes (sites:read).");
      return;
    }
    console.log("Sites available to this token:\n");
    for (const s of list) {
      console.log(`  id: ${s.id}`);
      console.log(`  displayName: ${s.displayName ?? s.shortName ?? "(unnamed)"}`);
      console.log("");
    }
    console.log("Set WEBFLOW_SITE_ID to the id for your marketing site, then run this script again without --list-sites.");
  });
}

async function listCollections(token, siteId) {
  const data = await wf(token, `/sites/${siteId}/collections`);
  return data.collections ?? [];
}

async function findExistingBannersCollection(token, siteId) {
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

async function getCollection(token, collectionId) {
  return wf(token, `/collections/${collectionId}`);
}

function bannerSlugsFromEnv() {
  return {
    message: process.env.WEBFLOW_BANNER_FIELD_MESSAGE ?? "message",
    linkUrl: process.env.WEBFLOW_BANNER_FIELD_LINK_URL ?? "link-url",
    active: process.env.WEBFLOW_BANNER_FIELD_ACTIVE ?? "active",
    expiresAt: process.env.WEBFLOW_BANNER_FIELD_EXPIRES_AT ?? "expires-at",
    urgent: process.env.WEBFLOW_BANNER_FIELD_URGENT ?? "urgent",
    urgentUntil: process.env.WEBFLOW_BANNER_FIELD_URGENT_UNTIL ?? "urgent-until",
    editorNotes: process.env.WEBFLOW_BANNER_FIELD_EDITOR_NOTES ?? "editor-notes",
  };
}

/** Keep aligned with src/lib/webflow/validate-banner-collection.ts */
const LOGICAL_TYPES = {
  message: ["PlainText"],
  linkUrl: ["PlainText", "Link"],
  active: ["Switch"],
  expiresAt: ["DateTime"],
  urgent: ["Switch"],
  urgentUntil: ["DateTime"],
  editorNotes: ["PlainText"],
};

function verifyFieldSlugs(collection) {
  const fields = collection.fields ?? [];
  const customSlugs = fields
    .map((f) => f.slug)
    .filter((slug) => slug && slug !== "name" && slug !== "slug");
  const missing = REQUIRED_CUSTOM_SLUGS.filter((s) => !customSlugs.includes(s));
  const extra = customSlugs.filter(
    (s) => !REQUIRED_CUSTOM_SLUGS.includes(s) && s !== "name" && s !== "slug"
  );
  return { customSlugs, missing, extra, fields };
}

/** Validates resolved env slugs + Webflow field types (same rules as the dashboard). */
function verifyBannerMapping(collection, slugs) {
  const fields = collection.fields ?? [];
  const issues = [];
  for (const [key, slug] of Object.entries(slugs)) {
    const f = fields.find((x) => x.slug === slug);
    if (!f) {
      issues.push(`Missing field "${key}": no Webflow field with slug "${slug}".`);
      continue;
    }
    const allow = LOGICAL_TYPES[key];
    if (!allow?.includes(f.type)) {
      issues.push(
        `Field "${slug}" (${key}) has type "${f.type}"; expected ${allow?.join(" or ") ?? "?"}.`
      );
    }
  }
  return issues;
}

async function main() {
  loadEnvFiles();
  const argv = process.argv.slice(2);
  const listSites = argv.includes("--list-sites");
  const verifyOnly = argv.includes("--verify");

  const token = getResolvedWebflowToken();
  if (!token) {
    console.error(
      "Missing Webflow token: set WEBFLOW_SITE_API_TOKEN or WEBFLOW_API_TOKEN in env or .env.local."
    );
    diagnoseMissingWebflowToken();
    process.exit(1);
  }

  if (listSites) {
    await printSites(token);
    return;
  }

  if (verifyOnly) {
    const collectionId = process.env.WEBFLOW_BANNERS_COLLECTION_ID?.trim();
    if (!collectionId) {
      console.error(
        "Missing WEBFLOW_BANNERS_COLLECTION_ID (set in env or .env.local)."
      );
      process.exit(1);
    }
    const detail = await getCollection(token, collectionId);
    const slugs = bannerSlugsFromEnv();
    console.log(
      `Verifying collection "${detail.displayName}" (${detail.slug})\nid: ${detail.id}\n`
    );
    console.log("Resolved field slugs from env:", JSON.stringify(slugs, null, 2));
    const issues = verifyBannerMapping(detail, slugs);
    if (issues.length) {
      console.error("Issues:\n", issues.map((i) => `  - ${i}`).join("\n"));
      process.exit(1);
    }
    console.log("OK — all banner fields exist with expected types.");
    process.exit(0);
  }

  const siteId =
    process.env.WEBFLOW_SITE_ID?.trim() ||
    (() => {
      const i = argv.indexOf("--site-id");
      return i >= 0 ? argv[i + 1]?.trim() : "";
    })();

  if (!siteId) {
    console.error("Missing WEBFLOW_SITE_ID. Run with --list-sites to pick a site id, then set WEBFLOW_SITE_ID.");
    process.exit(1);
  }

  const existing = await findExistingBannersCollection(token, siteId);
  if (existing) {
    console.log(`Collection already exists: "${existing.displayName}" (${existing.slug})`);
    console.log(`WEBFLOW_BANNERS_COLLECTION_ID=${existing.id}\n`);
    const detail = await getCollection(token, existing.id);
    const { missing, customSlugs } = verifyFieldSlugs(detail);
    console.log("Field slugs on this collection:", customSlugs.join(", "));
    const slugs = bannerSlugsFromEnv();
    const mapIssues = verifyBannerMapping(detail, slugs);
    if (missing.length) {
      console.warn(
        "\nWARNING: Missing default slugs:",
        missing.join(", "),
        "\nAdd fields in Webflow Designer or set WEBFLOW_BANNER_FIELD_* overrides in .env.local."
      );
    } else {
      console.log("\nAll default banner field slugs are present.");
    }
    if (mapIssues.length) {
      console.warn(
        "\nMapping / type issues for your env slugs:\n",
        mapIssues.map((i) => `  - ${i}`).join("\n")
      );
    } else {
      console.log("Env slug + type mapping matches the dashboard.");
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

  console.log(`Creating collection "${COLLECTION_DISPLAY}" on site ${siteId}…`);
  let created;
  try {
    created = await wf(token, `/sites/${siteId}/collections`, {
      method: "POST",
      body: payload,
    });
  } catch (e) {
    if (e.status === 409) {
      console.error("Webflow returned conflict (collection may already exist). Re-run; the script will detect it.");
    }
    throw e;
  }

  const id = created.id;
  console.log("\nCreated successfully.");
  console.log(`WEBFLOW_BANNERS_COLLECTION_ID=${id}`);
  console.log(
    "\nAdd both to .env.local (and restart next dev), plus WEBFLOW_SITE_API_TOKEN (or WEBFLOW_API_TOKEN) if not already set:"
  );

  const detail = await getCollection(token, id);
  const { missing, customSlugs } = verifyFieldSlugs(detail);
  console.log("\nField slugs:", customSlugs.join(", "));
  const slugs = bannerSlugsFromEnv();
  const mapIssues = verifyBannerMapping(detail, slugs);
  if (missing.length) {
    console.warn("Unexpected: missing slugs after create:", missing.join(", "));
    console.warn("Set WEBFLOW_BANNER_FIELD_* env vars to match Webflow, or rename fields in Designer.");
  }
  if (mapIssues.length) {
    console.warn("Mapping issues:\n", mapIssues.map((i) => `  - ${i}`).join("\n"));
  }

  console.log(
    "\nNext: In Webflow Designer, open the site → CMS → publish. Bind a Collection List on the site to this collection for the live banner UI."
  );
}

main().catch((e) => {
  console.error(e.message || e);
  if (e.body) console.error(JSON.stringify(e.body, null, 2));
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Bulk-create 2026 Monthly Silent Book Club events in Webflow (third Sunday of each month).
 * Only **May through December** — early-year months are omitted on purpose for this series run.
 *
 * Requires: WEBFLOW_SITE_API_TOKEN (or WEBFLOW_API_TOKEN), WEBFLOW_EVENTS_COLLECTION_ID
 * Optional: WEBFLOW_SITE_ID (for publish on localized sites), WEBFLOW_EVENTS_SKIP_PUBLISH=true
 * Optional location overrides:
 *   WEBFLOW_SILENT_BOOK_LOCATION_NAME (default: Watershed Pub)
 *   WEBFLOW_SILENT_BOOK_LOCATION_ADDRESS
 *   WEBFLOW_SILENT_BOOK_LOCATION_URL
 *   WEBFLOW_SILENT_BOOK_COMMITTEE_ITEM_ID (Reference item id for Outreach / committee)
 *
 * Usage:
 *   node scripts/bulk-silent-book-club-2026.mjs --dry-run
 *   node scripts/bulk-silent-book-club-2026.mjs
 *
 * Dry-run still calls GET /collections/:id to match the live schema (e.g. optional event-date-and-time).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { eventSlugsFromEnv } from "./webflow-events-schema.mjs";
import { plainTextToEventRichTextHtml } from "./plain-to-rich-html.mjs";

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

function slugify(name) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 96) || "event"
  );
}

/** Third Sunday: month is 1-12 */
function thirdSundayParts(year, month) {
  const z = month - 1;
  let n = 0;
  for (let d = 1; d <= 31; d++) {
    const t = new Date(year, z, d);
    if (t.getMonth() !== z) break;
    if (t.getDay() === 0) {
      n++;
      if (n === 3) return { y: year, m: month, d };
    }
  }
  throw new Error(`No third Sunday in ${year}-${String(month).padStart(2, "0")}`);
}

/**
 * Seattle wall time to ISO UTC. dst = true means PDT (UTC-7), false means PST (UTC-8).
 */
function seattleLocalToIso(y, mon, day, hour, minute, dst) {
  const add = dst ? 7 : 8;
  return new Date(Date.UTC(y, mon - 1, day, hour + add, minute, 0, 0)).toISOString();
}

/** US DST for Seattle-area events in 2026 (simplified for our third-Sunday dates only). */
function dstForThirdSunday2026(month, day) {
  if (month <= 2) return false;
  if (month >= 4 && month <= 10) return true;
  if (month === 3) return day >= 8;
  return false;
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
    const extra =
      process.env.DEBUG_WEBFLOW === "1" && json && typeof json === "object"
        ? ` ${JSON.stringify(json).slice(0, 2000)}`
        : "";
    throw new Error(`Webflow ${method} ${pathname} → ${res.status}: ${msg}${extra}`);
  }
  return json;
}

/** Months included in this bulk run (May–Dec only). */
const SILENT_BOOK_MONTHS = [5, 6, 7, 8, 9, 10, 11, 12];

/** Distinct seasonal angles per month (plain prose, no em dash habit). */
const SILENT_BOOK_COPY = {
  5: {
    title: "May Silent Book Club",
    shortDescription:
      "Late-spring Sunday with neighbors at Watershed: a quiet hour with your book, then optional hellos. Third Sunday.",
    body:
      "May in Maple Leaf means lighter evenings and a little extra energy outdoors, which makes an indoor reading hour feel like a treat.\n\n" +
      "Silent Book Club stays easy: bring what you are reading, enjoy companionable silence, then chat if you want to. Maple Leaf Community Council hosts at Watershed Pub.\n\n" +
      "Third Sunday of the month.",
  },
  6: {
    title: "June Silent Book Club",
    shortDescription:
      "Kick off summer Sundays with a low-key read among neighbors. Third Sunday at Watershed.",
    body:
      "June is when Seattle starts acting like summer, and a calm table with a book can be the perfect counterbalance.\n\n" +
      "Join us at Watershed Pub for Silent Book Club: no agenda, no prep, just neighbors and pages. Maple Leaf Community Council welcomes newcomers anytime.\n\n" +
      "Third Sunday of the month.",
  },
  7: {
    title: "July Silent Book Club",
    shortDescription:
      "Summer Sunday reading with neighbors. Cool drinks nearby, no script, no homework. Third Sunday.",
    body:
      "July is peak porch-and-park season, but sometimes the nicest thing is a quiet table and a good chapter. Silent Book Club is simple: bring your book, read in good company, chat if you want to afterward.\n\n" +
      "We gather at Watershed Pub. Maple Leaf Community Council keeps it welcoming for first timers and regulars alike.\n\n" +
      "Third Sunday of the month.",
  },
  8: {
    title: "August Silent Book Club",
    shortDescription:
      "Get out of the heat and come read. Third Sunday gathering at Watershed: calm hour, friendly neighbors.",
    body:
      "When August afternoons feel thick and warm, an hour of quiet reading in good company can be its own little break. Silent Book Club is not a class and not a debate club. It is a roomful of neighbors turning pages together.\n\n" +
      "We meet at Watershed Pub. Maple Leaf Community Council hosts; you bring whatever you are reading.\n\n" +
      "Third Sunday of the month.",
  },
  9: {
    title: "September Silent Book Club",
    shortDescription:
      "September rhythm: ease back into school-week schedules with one calm reading hour. Third Sunday.",
    body:
      "September is when calendars fill up again. Silent Book Club stays a steady third-Sunday anchor: simple, predictable, and kind.\n\n" +
      "Bring a book, read quietly alongside neighbors at Watershed Pub, then swap a quick hello or slip out. Maple Leaf Community Council welcomes newcomers anytime.\n\n" +
      "Third Sunday of the month.",
  },
  10: {
    title: "October Silent Book Club",
    shortDescription:
      "Fall into a good book with Maple Leaf neighbors. Silent reader meetup, third Sunday at Watershed.",
    body:
      "October light gets golden and the days shorten, which makes a cozy reading hour even nicer. Join Silent Book Club for companionable silence, no discussion pressure, then optional chatting.\n\n" +
      "Maple Leaf Community Council hosts at Watershed Pub. Pick any book. First timers are welcome.\n\n" +
      "Third Sunday of the month.",
  },
  11: {
    title: "November Silent Book Club",
    shortDescription:
      "Rainy-season Sunday: tuck in for a quiet read with neighbors before the week spins up. Third Sunday.",
    body:
      "November Sundays were made for tea, socks, and a stolen hour with a book. Silent Book Club keeps the vibe low key: read together, talk a little if you like, then head home.\n\n" +
      "We meet at Watershed Pub. Maple Leaf Community Council is glad you are here, whether it is your first visit or your twelfth.\n\n" +
      "Third Sunday of the month.",
  },
  12: {
    title: "December Silent Book Club",
    shortDescription:
      "Pause before the holiday rush: a calm hour of reading with neighbors. Third Sunday at Watershed.",
    body:
      "December calendars can get loud. Silent Book Club is the opposite: a small pocket of quiet with neighbors who get it.\n\n" +
      "Bring your book to Watershed Pub. Maple Leaf Community Council hosts this monthly tradition on the third Sunday.\n\n" +
      "No prep required. Newcomers welcome.",
  },
};

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

  const slugs = eventSlugsFromEnv();
  const rawLegacyDt = process.env.WEBFLOW_EVENT_EVENT_DATE_AND_TIME_SLUG?.trim() ?? "";
  const legacyDtDisabled =
    rawLegacyDt !== "" &&
    ["false", "none", "off", "-"].includes(rawLegacyDt.toLowerCase());
  const eventDateAndTimeSlug =
    rawLegacyDt && !legacyDtDisabled ? rawLegacyDt : "event-date-and-time";

  const collection = await wf(token, `/collections/${collectionId}`);
  const schemaSlugs = new Set((collection.fields ?? []).map((f) => f.slug));

  const includeEventDateAndTime =
    !legacyDtDisabled && schemaSlugs.has(eventDateAndTimeSlug);

  const longDescSlug = slugs.longDescription;
  const includeLongDescription = schemaSlugs.has(longDescSlug);

  if (!includeLongDescription) {
    console.warn(
      `No "${longDescSlug}" in collection — writing plain text to "${slugs.body}" only. Add Long description (Rich text) or set WEBFLOW_EVENT_LONG_DESCRIPTION_SLUG.`
    );
  }

  if (!includeEventDateAndTime && !legacyDtDisabled) {
    console.warn(
      `Skipping "${eventDateAndTimeSlug}" (not in collection schema). Set WEBFLOW_EVENT_EVENT_DATE_AND_TIME_SLUG if your combined DateTime field uses another slug.`
    );
  }

  const locName =
    process.env.WEBFLOW_SILENT_BOOK_LOCATION_NAME?.trim() || "Watershed Pub";
  const locAddress =
    process.env.WEBFLOW_SILENT_BOOK_LOCATION_ADDRESS?.trim() ||
    "10104 Roosevelt Way NE, Seattle, WA 98125";
  const locUrl =
    process.env.WEBFLOW_SILENT_BOOK_LOCATION_URL?.trim() ||
    "https://www.google.com/maps/search/?api=1&query=Watershed%20Pub%20Seattle";
  const committeeId = process.env.WEBFLOW_SILENT_BOOK_COMMITTEE_ITEM_ID?.trim() || null;

  const startHour = parseInt(process.env.WEBFLOW_SILENT_BOOK_START_HOUR ?? "15", 10);
  const startMinute = parseInt(process.env.WEBFLOW_SILENT_BOOK_START_MINUTE ?? "0", 10);
  const endHour = parseInt(process.env.WEBFLOW_SILENT_BOOK_END_HOUR ?? "16", 10);
  const endMinute = parseInt(process.env.WEBFLOW_SILENT_BOOK_END_MINUTE ?? "0", 10);

  const year = 2026;
  const createdIds = [];

  for (const month of SILENT_BOOK_MONTHS) {
    const copy = SILENT_BOOK_COPY[month];
    if (!copy) continue;

    const { y, m, d } = thirdSundayParts(year, month);
    const dst = dstForThirdSunday2026(m, d);
    const startsAt = seattleLocalToIso(y, m, d, startHour, startMinute, dst);
    const endsAt = seattleLocalToIso(y, m, d, endHour, endMinute, dst);

    const fieldData = {
      [slugs.name]: copy.title,
      [slugs.slug]: slugify(copy.title),
      [slugs.startsAt]: startsAt,
      [slugs.endsAt]: endsAt,
      [slugs.shortDescription]: copy.shortDescription,
      [slugs.locationName]: locName,
      [slugs.locationAddress]: locAddress,
      [slugs.locationUrl]: locUrl,
      [slugs.locationPlaceId]: null,
      [slugs.isExternal]: false,
      [slugs.externalEventUrl]: null,
      [slugs.externalOrgName]: null,
      [slugs.externalOrgUrl]: null,
    };
    if (includeLongDescription) {
      fieldData[slugs.longDescription] = plainTextToEventRichTextHtml(copy.body);
      if (schemaSlugs.has(slugs.body)) {
        fieldData[slugs.body] = null;
      }
    } else {
      fieldData[slugs.body] = copy.body;
    }
    if (includeEventDateAndTime) {
      fieldData[eventDateAndTimeSlug] = startsAt;
    }
    if (committeeId) {
      fieldData[slugs.committee] = committeeId;
    }

    const payload = {
      isArchived: false,
      isDraft: false,
      fieldData,
    };

    if (dryRun) {
      console.log(`\n--- ${copy.title} (${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}) ---`);
      console.log(JSON.stringify(payload, null, 2));
      continue;
    }

    const created = await wf(token, `/collections/${collectionId}/items`, {
      method: "POST",
      body: payload,
    });
    const id = created?.id;
    if (!id) {
      console.error("Unexpected response:", created);
      process.exit(1);
    }
    createdIds.push(id);
    console.log(`Created ${copy.title} → ${id}`);
  }

  if (dryRun) {
    console.log("\nDry run only. Re-run without --dry-run to create items.");
    return;
  }

  if (createdIds.length === 0 || process.env.WEBFLOW_EVENTS_SKIP_PUBLISH === "true") {
    console.log("\nSkip publish (no items or WEBFLOW_EVENTS_SKIP_PUBLISH=true).");
    return;
  }

  if (!siteId) {
    console.warn(
      "\nWEBFLOW_SITE_ID not set: attempting simple publish. If your site uses locales, set WEBFLOW_SITE_ID and publish from the dashboard if this fails."
    );
  }

  try {
    const publishBody = { itemIds: createdIds };
    await wf(token, `/collections/${collectionId}/items/publish`, {
      method: "POST",
      body: publishBody,
    });
    console.log(`\nPublished ${createdIds.length} items.`);
  } catch (e) {
    console.warn("\nPublish failed (items are still in CMS):", e.message);
    console.warn("Publish from Webflow Designer if needed.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

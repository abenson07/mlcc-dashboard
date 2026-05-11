/**
 * Fetch all Webflow Events CMS items, rewrite "short description" to ~72 chars via Claude,
 * PATCH Webflow, then publish (unless WEBFLOW_EVENTS_SKIP_PUBLISH=true).
 *
 * Requires: ANTHROPIC_API_KEY, WEBFLOW_SITE_API_TOKEN (or WEBFLOW_API_TOKEN), WEBFLOW_EVENTS_COLLECTION_ID
 * Optional: WEBFLOW_SITE_ID (localized publish), WEBFLOW_EVENT_SHORT_DESCRIPTION_SLUG, ANTHROPIC_MODEL
 *
 *   npx tsx scripts/rewrite-event-short-descriptions.ts --dry-run
 *   npx tsx scripts/rewrite-event-short-descriptions.ts
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { webflowJson } from "../src/lib/webflow/client";
import { publishCollectionItemIds } from "../src/lib/webflow/publishItems";
import { getWebflowApiToken, getWebflowEventsCollectionId } from "../src/lib/webflow/env";
import { getEventFieldSlugs } from "../src/lib/webflow/event-field-slugs";

const MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6";
const BATCH = 14;
const MAX_CHARS = 78;
const TARGET = 72;

type WfItem = {
  id: string;
  isArchived?: boolean;
  fieldData?: Record<string, unknown>;
};

function repoRoot(): string {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
}

function parseEnvLine(rawLine: string): { key: string; val: string } | null {
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

/** Makes ANTHROPIC_* available when running outside Next (tsx). */
function loadEnvFiles(): void {
  const root = repoRoot();
  for (const name of [".env.local", ".env"]) {
    const p = path.join(root, name);
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

function readVoiceGuide(): string {
  const p = path.join(repoRoot(), "src/content/marketing-event-voice-tone.md");
  return fs.readFileSync(p, "utf8");
}

function clampTeaser(s: string): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= MAX_CHARS) return t;
  const cut = t.slice(0, MAX_CHARS - 1);
  const i = cut.lastIndexOf(" ");
  const base = i > 36 ? cut.slice(0, i) : cut;
  return `${base.trimEnd()}…`;
}

function extractMessageJsonObject(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence?.[1]?.trim() ?? text.trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain a JSON object.");
  }
  return candidate.slice(start, end + 1);
}

async function listAllItems(token: string, collectionId: string): Promise<WfItem[]> {
  const all: WfItem[] = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const res = await webflowJson<{
      items: WfItem[];
      pagination: { total: number; limit: number; offset: number };
    }>(token, `/collections/${collectionId}/items?offset=${offset}&limit=${limit}`);
    const batch = res.items ?? [];
    all.push(...batch);
    const total = res.pagination?.total ?? all.length;
    if (all.length >= total || batch.length < limit) break;
    offset += limit;
  }
  return all;
}

async function rewriteBatch(
  client: Anthropic,
  voiceMd: string,
  rows: Array<{ id: string; name: string; currentShort: string }>
): Promise<Array<{ id: string; shortDescription: string }>> {
  const system = `You write ultra-short event listing teasers for Maple Leaf Community Council (MLCC), a Seattle neighborhood nonprofit.

Output ONLY a single JSON object, no markdown outside it, with shape:
{ "items": [ { "id": "<same as input>", "shortDescription": "..." } ] }

Rules for each shortDescription:
- Plain text only (no HTML, no quotes inside the string that break JSON — escape if needed).
- Target about ${TARGET} characters; stay between 65 and ${MAX_CHARS} characters when possible.
- One crisp phrase: who/what/when or where — not a full sentence with every detail.
- Follow the voice guide in the user message.
- Do not repeat the entire event name if it is already obvious from the title field.
- Prefer commas or periods over em dashes.`;

  const user = `## Voice & tone (event-focused guide excerpt and full doc follows)

Use the **Short descriptions (Webflow / event cards)** rules and all of **§6 Framing** and **§10 Quality check** literally.

---

${voiceMd}

---

## Events to rewrite

Rewrite the shortDescription for each row. Keep the same \`id\` values and array order.

${JSON.stringify({ items: rows }, null, 2)}`;

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: user }],
  });

  const block = msg.content.find((c) => c.type === "text");
  const text = block && block.type === "text" ? block.text : "";
  if (!text) throw new Error("Empty model response");

  const raw = extractMessageJsonObject(text);
  const parsed = JSON.parse(raw) as { items?: unknown };
  const out = parsed.items;
  if (!Array.isArray(out)) {
    throw new Error('Expected { "items": [...] } from model');
  }

  return out.map((row, i) => {
    if (!row || typeof row !== "object") throw new Error(`Invalid row ${i}`);
    const r = row as Record<string, unknown>;
    const id = typeof r.id === "string" ? r.id : "";
    const shortDescription = typeof r.shortDescription === "string" ? r.shortDescription : "";
    if (!id || !shortDescription.trim()) {
      throw new Error(`Missing id or shortDescription at index ${i}`);
    }
    return { id, shortDescription: clampTeaser(shortDescription) };
  });
}

async function main() {
  loadEnvFiles();
  const dryRun = process.argv.includes("--dry-run");
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    console.error("Set ANTHROPIC_API_KEY.");
    process.exit(1);
  }

  const token = getWebflowApiToken();
  const collectionId = getWebflowEventsCollectionId();
  if (!token || !collectionId) {
    console.error("Set WEBFLOW_SITE_API_TOKEN (or WEBFLOW_API_TOKEN) and WEBFLOW_EVENTS_COLLECTION_ID.");
    process.exit(1);
  }

  const slugs = getEventFieldSlugs();
  const shortSlug = process.env.WEBFLOW_EVENT_SHORT_DESCRIPTION_SLUG?.trim() || slugs.shortDescription;

  const voiceMd = readVoiceGuide();
  const items = (await listAllItems(token, collectionId)).filter((it) => !it.isArchived);

  type Row = { id: string; name: string; currentShort: string };
  const rows: Row[] = [];
  for (const it of items) {
    const fd = it.fieldData ?? {};
    const name = String(fd[slugs.name] ?? fd.name ?? "Untitled event").trim();
    const currentShort = String(fd[shortSlug] ?? "").trim();
    rows.push({ id: it.id, name, currentShort });
  }

  if (rows.length === 0) {
    console.log("No events in collection.");
    return;
  }

  console.log(`Loaded ${rows.length} event(s). Rewriting short descriptions (~${TARGET}ch)…`);

  const client = new Anthropic({ apiKey });
  const idToNew = new Map<string, string>();

  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const rewritten = await rewriteBatch(client, voiceMd, chunk);
    if (rewritten.length !== chunk.length) {
      throw new Error(`Batch size mismatch: expected ${chunk.length}, got ${rewritten.length}`);
    }
    for (let j = 0; j < chunk.length; j++) {
      if (rewritten[j].id !== chunk[j].id) {
        throw new Error(`Id order mismatch at batch offset ${i + j}`);
      }
      idToNew.set(rewritten[j].id, rewritten[j].shortDescription);
    }
    console.log(`  Batch ${Math.floor(i / BATCH) + 1}: ${chunk.length} item(s)`);
  }

  const updated: string[] = [];
  for (const row of rows) {
    const next = idToNew.get(row.id);
    if (!next) continue;
    const unchanged = next === row.currentShort;
    if (unchanged) {
      console.log(`Skip (unchanged): ${row.name}`);
      continue;
    }
    if (dryRun) {
      console.log(`[dry-run] ${row.name}`);
      console.log(`  was (${row.currentShort.length}ch): ${row.currentShort}`);
      console.log(`  new (${next.length}ch): ${next}`);
      updated.push(row.id);
      continue;
    }
    await webflowJson(token, `/collections/${collectionId}/items/${encodeURIComponent(row.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        isDraft: false,
        fieldData: { [shortSlug]: next },
      }),
    });
    updated.push(row.id);
    console.log(`Updated ${row.name} (${next.length}ch)`);
  }

  if (dryRun) {
    console.log(`\nDry run only. ${updated.length} item(s) would be updated.`);
    return;
  }

  if (updated.length === 0) {
    console.log("\nNo Webflow updates needed.");
    return;
  }

  if (process.env.WEBFLOW_EVENTS_SKIP_PUBLISH === "true") {
    console.log("\nSkip publish (WEBFLOW_EVENTS_SKIP_PUBLISH=true).");
    return;
  }

  try {
    await publishCollectionItemIds(token, collectionId, updated);
    console.log(`\nPublished ${updated.length} item(s).`);
  } catch (e) {
    console.warn("\nPublish failed (short descriptions are saved in CMS):", e);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

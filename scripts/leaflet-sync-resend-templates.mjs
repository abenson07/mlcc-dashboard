#!/usr/bin/env node
/**
 * List Resend templates and/or sync leaflet comm_settings.resend_template_id from aliases.
 *
 *   node scripts/leaflet-sync-resend-templates.mjs --list
 *   node scripts/leaflet-sync-resend-templates.mjs --apply
 */
import { readFileSync } from "fs";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const STEP_TO_ALIAS = {
  initial_confirmation: "leaflet-initial-confirmation",
  pre_distribution_reminder: "leaflet-pre-distribution-reminder",
  distribution_day_pickup: "leaflet-distribution-day-pickup",
  delivery_complete_prompt: "leaflet-delivery-complete",
  completion_followup: "leaflet-completion-followup",
};

function loadEnvLocal() {
  try {
    return readFileSync(".env.local", "utf8");
  } catch {
    return "";
  }
}

function envGet(raw, key) {
  const m = raw.match(new RegExp(`^${key}=(.+)$`, "m"));
  return m?.[1]?.trim() ?? process.env[key]?.trim();
}

const envRaw = loadEnvLocal();
const resendKey = envGet(envRaw, "RESEND_API_KEY");
const supabaseUrl = envGet(envRaw, "NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = envGet(envRaw, "SUPABASE_SERVICE_ROLE_KEY");

if (!resendKey) {
  console.error("RESEND_API_KEY missing");
  process.exit(1);
}

const resend = new Resend(resendKey);
const listOnly = process.argv.includes("--list");
const apply = process.argv.includes("--apply");

const all = [];
let after;
for (let i = 0; i < 10; i++) {
  const opts = { limit: 50 };
  if (after) opts.after = after;
  const { data, error } = await resend.templates.list(opts);
  if (error) {
    console.error(error);
    process.exit(1);
  }
  const items = data?.data ?? [];
  all.push(...items);
  if (!data?.has_more || !items.length) break;
  after = items[items.length - 1]?.id;
}

console.log("Templates:");
for (const t of all) {
  console.log(`  ${t.id}  ${t.alias ?? "—"}  ${t.name}`);
}

if (listOnly && !apply) process.exit(0);

const byAlias = new Map(all.filter((t) => t.alias).map((t) => [t.alias, t.id]));

if (!apply) {
  console.log("\nDry-run mapping:");
  for (const [step, alias] of Object.entries(STEP_TO_ALIAS)) {
    console.log(`  ${step} -> ${byAlias.get(alias) ?? "MISSING"}`);
  }
  console.log("\nRe-run with --apply to update comm_settings in Supabase.");
  process.exit(0);
}

if (!supabaseUrl || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for --apply");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);
for (const [step, alias] of Object.entries(STEP_TO_ALIAS)) {
  const templateId = byAlias.get(alias);
  if (!templateId) {
    console.warn(`Skip ${step}: no template with alias ${alias}`);
    continue;
  }
  const { error } = await supabase
    .from("comm_settings")
    .update({ resend_template_id: templateId, updated_at: new Date().toISOString() })
    .eq("context", "leaflet")
    .eq("step_key", step);
  if (error) {
    console.error(step, error.message);
    process.exit(1);
  }
  console.log(`Updated ${step} -> ${templateId}`);
}

console.log("Done.");

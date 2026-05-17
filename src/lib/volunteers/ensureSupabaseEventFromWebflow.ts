import type { SupabaseClient } from "@supabase/supabase-js";
import { webflowJson } from "@/lib/webflow/client";
import {
  fetchEventsCollection,
  getEventsEnv,
  pickCalendarFieldSlug,
  pickTitleFieldSlug,
  type WebflowEventItem,
} from "@/lib/webflow/eventsWorkspace";

function readStr(v: unknown): string {
  if (v == null) return "";
  return typeof v === "string" ? v.trim() : String(v);
}

function webflowDateToPgDate(value: unknown): string | null {
  const raw = readStr(value);
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export async function ensureSupabaseEventFromWebflow(
  supabase: SupabaseClient,
  webflowEventItemId: string
): Promise<string> {
  const env = getEventsEnv();
  if (!env) {
    throw new Error(
      "Webflow events are not configured (WEBFLOW_EVENTS_COLLECTION_ID and API token)."
    );
  }

  const collection = await fetchEventsCollection(env.token, env.collectionId);
  const item = await webflowJson<WebflowEventItem>(
    env.token,
    `/collections/${env.collectionId}/items/${encodeURIComponent(webflowEventItemId)}`,
    { method: "GET" }
  );

  const titleSlug = pickTitleFieldSlug(collection.fields);
  const calendarSlug = pickCalendarFieldSlug(collection.fields);
  const fd = item.fieldData ?? {};
  const name = readStr(fd[titleSlug] || fd.name) || "Untitled event";
  const date = calendarSlug ? webflowDateToPgDate(fd[calendarSlug]) : null;

  const { data: byName, error: lookupError } = await supabase
    .from("events")
    .select("id")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Failed to look up event: ${lookupError.message}`);
  }
  if (byName?.id) return byName.id;

  const { data: created, error: insertError } = await supabase
    .from("events")
    .insert({ name, date })
    .select("id")
    .single();

  if (insertError || !created) {
    throw new Error(insertError?.message ?? "Failed to create linked event row.");
  }
  return created.id;
}

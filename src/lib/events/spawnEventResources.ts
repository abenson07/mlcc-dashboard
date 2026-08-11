import type { SupabaseClient } from "@supabase/supabase-js";
import type { Events } from "@/types/database";
import type { SponsorshipTierSeed } from "@/lib/sponsorship/tierPlaceholders";

export type { SponsorshipTierSeed };

export async function spawnEventTasks(
  supabase: SupabaseClient,
  event: Pick<Events, "id" | "event_template_id">,
): Promise<{ spawned: number; skipped: boolean }> {
  if (!event.event_template_id) {
    return { spawned: 0, skipped: true };
  }

  const { count, error: countError } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("context", "event")
    .eq("context_id", event.id);

  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) return { spawned: 0, skipped: true };

  const { data: taskTemplates, error: templatesError } = await supabase
    .from("task_templates")
    .select("*")
    .eq("context", "event")
    .eq("is_active", true)
    .eq("event_template_id", event.event_template_id);

  if (templatesError) throw new Error(templatesError.message);
  if (!taskTemplates?.length) return { spawned: 0, skipped: true };

  const tasks = taskTemplates.map((t) => ({
    context: "event" as const,
    context_id: event.id,
    template_id: t.id,
    title: t.title,
    description: t.description,
    offset_days: t.offset_days,
  }));

  const { error: tasksError } = await supabase.from("tasks").insert(tasks);
  if (tasksError) throw new Error(tasksError.message);

  return { spawned: tasks.length, skipped: false };
}

/**
 * Seeds this event's sponsorship_item_offerings from the sponsorship_item_templates
 * suggested for its event_template — same copy-on-activate shape as spawnEventTasks.
 * Real purchases live in `sponsorships` (with `sponsorship_item_id` set), never here.
 */
export async function spawnEventSponsorshipTiers(
  supabase: SupabaseClient,
  event: Pick<Events, "id" | "event_template_id">,
): Promise<{ spawned: number; skipped: boolean }> {
  if (!event.event_template_id) {
    return { spawned: 0, skipped: true };
  }

  const { count, error: countError } = await supabase
    .from("sponsorship_item_offerings")
    .select("id", { count: "exact", head: true })
    .eq("event_id", event.id);

  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) return { spawned: 0, skipped: true };

  const { data: itemTemplates, error: templatesError } = await supabase
    .from("sponsorship_item_templates")
    .select("sponsorship_item_id, quantity_available")
    .eq("context", "event")
    .eq("is_active", true)
    .eq("event_template_id", event.event_template_id);

  if (templatesError) throw new Error(templatesError.message);
  if (!itemTemplates?.length) return { spawned: 0, skipped: true };

  const rows = itemTemplates.map((t) => ({
    event_id: event.id,
    leaflet_id: null,
    sponsorship_item_id: t.sponsorship_item_id,
    quantity_available: t.quantity_available,
  }));

  const { error: insertError } = await supabase.from("sponsorship_item_offerings").insert(rows);
  if (insertError) throw new Error(insertError.message);

  return { spawned: rows.length, skipped: false };
}

export async function activateEventResources(
  supabase: SupabaseClient,
  event: Events,
): Promise<{ tasksSpawned: number; sponsorshipsSpawned: number }> {
  const [tasks, sponsorships] = await Promise.all([
    spawnEventTasks(supabase, event),
    spawnEventSponsorshipTiers(supabase, event),
  ]);

  return {
    tasksSpawned: tasks.spawned,
    sponsorshipsSpawned: sponsorships.spawned,
  };
}

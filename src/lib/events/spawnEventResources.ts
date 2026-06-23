import type { SupabaseClient } from "@supabase/supabase-js";
import type { Events } from "@/types/database";
import { SPONSORSHIP_TIER_DEFS } from "@/components/leaflet/leafletData";

export type SponsorshipTierSeed = {
  name: string;
  amount: number;
  quantity: number;
};

export function parseSponsorshipTiersFromFieldData(
  fieldData: Record<string, unknown> | null | undefined,
): SponsorshipTierSeed[] {
  const raw = fieldData?.sponsorship_tiers;
  if (!Array.isArray(raw) || raw.length === 0) {
    return SPONSORSHIP_TIER_DEFS.map((tier) => ({
      name: tier.name,
      amount: tier.amount,
      quantity:
        tier.name === "Platinum"
          ? 1
          : tier.name === "Gold"
            ? 2
            : tier.name === "Silver"
              ? 4
              : 8,
    }));
  }

  const tiers: SponsorshipTierSeed[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const amount = Number(o.amount);
    const quantity = Number(o.quantity);
    if (!name || !Number.isFinite(amount) || amount <= 0) continue;
    tiers.push({
      name,
      amount,
      quantity: Number.isFinite(quantity) && quantity >= 1 ? quantity : 1,
    });
  }

  return tiers.length > 0
    ? tiers
    : SPONSORSHIP_TIER_DEFS.map((tier) => ({
        name: tier.name,
        amount: tier.amount,
        quantity:
          tier.name === "Platinum"
            ? 1
            : tier.name === "Gold"
              ? 2
              : tier.name === "Silver"
                ? 4
                : 8,
      }));
}

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

export async function spawnEventSponsorshipTiers(
  supabase: SupabaseClient,
  event: Pick<Events, "id">,
  fieldData: Record<string, unknown> | null | undefined,
): Promise<{ spawned: number; skipped: boolean }> {
  const { count, error: countError } = await supabase
    .from("sponsorships")
    .select("id", { count: "exact", head: true })
    .eq("event_id", event.id);

  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) return { spawned: 0, skipped: true };

  const tiers = parseSponsorshipTiersFromFieldData(fieldData);
  const rows = tiers.map((tier) => ({
    event_id: event.id,
    leaflet_id: null,
    business_id: null,
    description: tier.name,
    amount: tier.amount,
    quantity: tier.quantity,
    status: null,
    memo: "Tier placeholder",
  }));

  const { error: insertError } = await supabase.from("sponsorships").insert(rows);
  if (insertError) throw new Error(insertError.message);

  return { spawned: rows.length, skipped: false };
}

export async function activateEventResources(
  supabase: SupabaseClient,
  event: Events,
): Promise<{ tasksSpawned: number; sponsorshipsSpawned: number }> {
  const fieldData =
    event.field_data && typeof event.field_data === "object"
      ? (event.field_data as Record<string, unknown>)
      : {};

  const [tasks, sponsorships] = await Promise.all([
    spawnEventTasks(supabase, event),
    spawnEventSponsorshipTiers(supabase, event, fieldData),
  ]);

  return {
    tasksSpawned: tasks.spawned,
    sponsorshipsSpawned: sponsorships.spawned,
  };
}

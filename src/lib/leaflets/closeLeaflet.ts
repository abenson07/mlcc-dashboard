import type { SupabaseClient } from "@supabase/supabase-js";
import type { Leaflets } from "@/types/database";
import { activateLeaflet } from "./activateLeaflet";

export async function closeLeaflet(
  supabase: SupabaseClient,
  leafletId: string,
  options?: { activateNext?: boolean },
): Promise<{ closed: Leaflets; nextActivated: Leaflets | null }> {
  const activateNext = options?.activateNext ?? true;

  const { data: closed, error } = await supabase
    .from("leaflets")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leafletId)
    .select()
    .single();

  if (error || !closed) {
    throw new Error(error?.message ?? "Failed to close leaflet");
  }

  let nextActivated: Leaflets | null = null;

  if (activateNext) {
    const { data: nextPlanned } = await supabase
      .from("leaflets")
      .select("*")
      .eq("status", "planned")
      .order("distribution_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextPlanned) {
      nextActivated = await activateLeaflet(supabase, nextPlanned.id);
    }
  }

  return { closed, nextActivated };
}

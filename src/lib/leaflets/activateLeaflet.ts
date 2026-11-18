import type { SupabaseClient } from "@supabase/supabase-js";
import type { Leaflets } from "@/types/database";

export class LeafletActivationConflictError extends Error {}

export async function activateLeaflet(
  supabase: SupabaseClient,
  leafletId: string,
  options?: { expectedActiveId: string | null },
): Promise<Leaflets> {
  if (options) {
    const { data, error } = await supabase
      .rpc("activate_leaflet_issue", {
        target_leaflet_id: leafletId,
        expected_active_leaflet_id: options.expectedActiveId,
      })
      .single<Leaflets>();
    if (error?.code === "40001" || error?.code === "23505") {
      throw new LeafletActivationConflictError("The active issue has changed. Close this dialog and try again.");
    }
    if (error?.code === "PGRST202") {
      throw new Error("Apply the leaflet activation database migration before using this action.");
    }
    if (error || !data) throw new Error(error?.message ?? "Failed to activate leaflet");
    return data;
  }

  const { data: existingActive } = await supabase
    .from("leaflets")
    .select("id")
    .eq("status", "active")
    .maybeSingle();

  if (existingActive && existingActive.id !== leafletId) {
    throw new Error("Another leaflet is already active. Close it before activating a new one.");
  }

  const { data, error } = await supabase
    .from("leaflets")
    .update({
      status: "active",
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leafletId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to activate leaflet");
  }

  return data;
}

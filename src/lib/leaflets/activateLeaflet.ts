import type { SupabaseClient } from "@supabase/supabase-js";
import type { Leaflets } from "@/types/database";

export async function activateLeaflet(
  supabase: SupabaseClient,
  leafletId: string,
): Promise<Leaflets> {
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

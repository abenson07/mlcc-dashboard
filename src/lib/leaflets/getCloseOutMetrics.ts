import type { SupabaseClient } from "@supabase/supabase-js";
import type { Deliveries, Leaflets } from "@/types/database";

export type CloseOutMetrics = {
  title: string;
  distributionDate: string;
  deliverersConfirmed: number;
  deliverersTotal: number;
  leafletsDelivered: number;
  changeVsLastRun: number | null;
  reroutes: number;
};

async function loadDeliveries(supabase: SupabaseClient, leafletId: string) {
  const { data, error } = await supabase
    .from("deliveries")
    .select("id, route_id, person_id, leaflet_count, leaflets_delivered, is_skipped, response")
    .eq("leaflet_id", leafletId);
  if (error) throw new Error(error.message);
  return (data ?? []) as Pick<
    Deliveries,
    | "id"
    | "route_id"
    | "person_id"
    | "leaflet_count"
    | "leaflets_delivered"
    | "is_skipped"
    | "response"
  >[];
}

function previousClosedLeaflet(leaflets: Leaflets[], current: Leaflets): Leaflets | null {
  return (
    leaflets
      .filter(
        (l) =>
          l.status === "closed" &&
          l.id !== current.id &&
          l.distribution_date < current.distribution_date,
      )
      .sort((a, b) => b.distribution_date.localeCompare(a.distribution_date))[0] ?? null
  );
}

export async function getCloseOutMetrics(
  supabase: SupabaseClient,
  leafletId: string,
): Promise<CloseOutMetrics> {
  const { data: leaflet, error: leafletError } = await supabase
    .from("leaflets")
    .select("*")
    .eq("id", leafletId)
    .single();
  if (leafletError || !leaflet) {
    throw new Error(leafletError?.message ?? "Leaflet not found");
  }

  const { data: allLeaflets, error: listError } = await supabase
    .from("leaflets")
    .select("id, title, distribution_date, status");
  if (listError) throw new Error(listError.message);

  const deliveries = await loadDeliveries(supabase, leafletId);
  const assigned = deliveries.filter((d) => d.person_id);
  const confirmedPeople = new Set(
    assigned.filter((d) => d.response === "confirmed").map((d) => d.person_id!),
  );

  const leafletsDelivered = deliveries.reduce(
    (sum, d) => sum + (d.leaflets_delivered ?? d.leaflet_count ?? 0),
    0,
  );

  const reroutes = deliveries.filter((d) => d.is_skipped).length;

  const prev = previousClosedLeaflet(allLeaflets as Leaflets[], leaflet as Leaflets);
  let changeVsLastRun: number | null = null;

  if (prev) {
    const prevDeliveries = await loadDeliveries(supabase, prev.id);
    const prevByRoute = new Map(prevDeliveries.map((d) => [d.route_id, d.leaflet_count ?? 0]));
    changeVsLastRun = deliveries.reduce((sum, d) => {
      const prevCount = prevByRoute.get(d.route_id);
      if (prevCount == null || d.leaflet_count == null) return sum;
      return sum + (d.leaflet_count - prevCount);
    }, 0);
  }

  return {
    title: leaflet.title,
    distributionDate: leaflet.distribution_date,
    deliverersConfirmed: confirmedPeople.size,
    deliverersTotal: new Set(assigned.map((d) => d.person_id!)).size,
    leafletsDelivered,
    changeVsLastRun,
    reroutes,
  };
}

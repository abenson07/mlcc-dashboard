import type { SupabaseClient } from "@supabase/supabase-js";
import type { Deliveries, Leaflets, People, Routes } from "@/types/database";

export type DelivererResponseAction = "confirm" | "needs_cover" | "reject" | "complete";

export type RespondDeliveryRow = Deliveries & {
  routes?: Routes | null;
};

export async function loadPersonRespondDeliveries(
  supabase: SupabaseClient,
  leafletId: string,
  personId: string,
): Promise<RespondDeliveryRow[]> {
  const { data, error } = await supabase
    .from("deliveries")
    .select("*, routes (*)")
    .eq("leaflet_id", leafletId)
    .eq("person_id", personId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as RespondDeliveryRow[];
}

async function assertDeliveriesBelongToPerson(
  supabase: SupabaseClient,
  leafletId: string,
  personId: string,
  deliveryIds: string[],
) {
  if (deliveryIds.length === 0) {
    throw new Error("Select at least one route.");
  }

  const { data, error } = await supabase
    .from("deliveries")
    .select("id")
    .eq("leaflet_id", leafletId)
    .eq("person_id", personId)
    .in("id", deliveryIds);

  if (error) throw new Error(error.message);
  if ((data ?? []).length !== deliveryIds.length) {
    throw new Error("One or more routes are invalid.");
  }
}

export async function completeAllDeliveriesForPerson(
  supabase: SupabaseClient,
  leafletId: string,
  personId: string,
) {
  const deliveries = await loadPersonRespondDeliveries(supabase, leafletId, personId);
  if (deliveries.length === 0) throw new Error("No routes found to complete.");

  const now = new Date().toISOString();
  const dateDelivered = now.slice(0, 10);

  for (const delivery of deliveries) {
    const { error } = await supabase
      .from("deliveries")
      .update({
        date_delivered: dateDelivered,
        leaflets_delivered: delivery.leaflet_count,
        updated_at: now,
      })
      .eq("id", delivery.id)
      .eq("leaflet_id", leafletId);

    if (error) throw new Error(error.message);
  }

  return deliveries;
}

export async function confirmAllDeliveriesForPerson(
  supabase: SupabaseClient,
  leafletId: string,
  personId: string,
) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("deliveries")
    .update({
      response: "confirmed",
      is_skipped: false,
      responded_at: now,
      updated_at: now,
    })
    .eq("leaflet_id", leafletId)
    .eq("person_id", personId)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("No routes found to confirm.");
  return data;
}

export async function skipDeliveriesForPerson(
  supabase: SupabaseClient,
  params: { leafletId: string; personId: string; deliveryIds: string[] },
) {
  await assertDeliveriesBelongToPerson(
    supabase,
    params.leafletId,
    params.personId,
    params.deliveryIds,
  );

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("deliveries")
    .update({
      response: "needs_cover",
      is_skipped: true,
      person_id: null,
      responded_at: now,
      updated_at: now,
    })
    .eq("leaflet_id", params.leafletId)
    .in("id", params.deliveryIds);

  if (error) throw new Error(error.message);

  const remaining = await loadPersonRespondDeliveries(
    supabase,
    params.leafletId,
    params.personId,
  );
  return { remainingCount: remaining.length };
}

export async function removeDeliveriesForPerson(
  supabase: SupabaseClient,
  params: { leafletId: string; personId: string; deliveryIds: string[] },
) {
  await assertDeliveriesBelongToPerson(
    supabase,
    params.leafletId,
    params.personId,
    params.deliveryIds,
  );

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("deliveries")
    .update({
      response: "rejected",
      person_id: null,
      responded_at: now,
      updated_at: now,
    })
    .eq("leaflet_id", params.leafletId)
    .in("id", params.deliveryIds);

  if (error) throw new Error(error.message);

  const remaining = await loadPersonRespondDeliveries(
    supabase,
    params.leafletId,
    params.personId,
  );
  return { removed: params.deliveryIds.length, remainingCount: remaining.length };
}

export type ReviewEdit = { count: number; action: "keep" | "skip" | "remove" };

export async function applyReviewedResponse(
  supabase: SupabaseClient,
  params: {
    leafletId: string;
    personId: string;
    edits: Record<string, ReviewEdit>;
  },
) {
  const deliveries = await loadPersonRespondDeliveries(supabase, params.leafletId, params.personId);
  const now = new Date().toISOString();

  await Promise.all(
    deliveries.map(async (delivery) => {
      const edit = params.edits[delivery.id];
      if (!edit) return;

      if (edit.action === "keep") {
        const { error } = await supabase
          .from("deliveries")
          .update({
            response: "confirmed",
            is_skipped: false,
            leaflet_count: edit.count,
            responded_at: now,
            updated_at: now,
          })
          .eq("id", delivery.id)
          .eq("leaflet_id", params.leafletId);
        if (error) throw new Error(error.message);
        return;
      }

      if (edit.action === "skip") {
        const { error } = await supabase
          .from("deliveries")
          .update({
            response: "needs_cover",
            is_skipped: true,
            person_id: null,
            leaflet_count: edit.count,
            responded_at: now,
            updated_at: now,
          })
          .eq("id", delivery.id)
          .eq("leaflet_id", params.leafletId);
        if (error) throw new Error(error.message);
        return;
      }

      // remove
      const { error } = await supabase
        .from("deliveries")
        .update({
          response: "rejected",
          person_id: null,
          responded_at: now,
          updated_at: now,
        })
        .eq("id", delivery.id)
        .eq("leaflet_id", params.leafletId);
      if (error) throw new Error(error.message);
    }),
  );

  const committedCount = deliveries.filter((d) => (params.edits[d.id]?.action ?? "keep") === "keep").length;
  const hasChanges = deliveries.some((d) => {
    const edit = params.edits[d.id];
    if (!edit) return false;
    return edit.action !== "keep" || edit.count !== (d.leaflet_count ?? 0);
  });

  return { committedCount, hasChanges };
}

export async function loadRespondContext(
  supabase: SupabaseClient,
  leafletId: string,
  personId: string,
) {
  const [{ data: leaflet, error: lErr }, { data: person, error: pErr }, deliveries] =
    await Promise.all([
      supabase.from("leaflets").select("id, title, distribution_date").eq("id", leafletId).single(),
      supabase.from("people").select("id, full_name").eq("id", personId).single(),
      loadPersonRespondDeliveries(supabase, leafletId, personId),
    ]);

  if (lErr || !leaflet) throw new Error(lErr?.message ?? "Leaflet not found");
  if (pErr || !person) throw new Error(pErr?.message ?? "Deliverer not found");

  return {
    leaflet: leaflet as Pick<Leaflets, "id" | "title" | "distribution_date">,
    person: person as Pick<People, "id" | "full_name">,
    deliveries,
  };
}

/** @deprecated Single-delivery handler — prefer bulk helpers above. */
export async function handleDelivererResponse(
  supabase: SupabaseClient,
  params: {
    leafletId: string;
    personId: string;
    deliveryId: string;
    action: DelivererResponseAction;
  },
) {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { updated_at: now, responded_at: now };

  switch (params.action) {
    case "confirm":
      return confirmAllDeliveriesForPerson(supabase, params.leafletId, params.personId);
    case "needs_cover":
      await skipDeliveriesForPerson(supabase, {
        leafletId: params.leafletId,
        personId: params.personId,
        deliveryIds: [params.deliveryId],
      });
      break;
    case "reject":
      await removeDeliveriesForPerson(supabase, {
        leafletId: params.leafletId,
        personId: params.personId,
        deliveryIds: [params.deliveryId],
      });
      break;
    case "complete": {
      const { data: updated, error: uError } = await supabase
        .from("deliveries")
        .update({ date_delivered: now.slice(0, 10), updated_at: now })
        .eq("id", params.deliveryId)
        .eq("leaflet_id", params.leafletId)
        .select()
        .single();
      if (uError) throw new Error(uError.message);
      return updated;
    }
    default:
      throw new Error("Invalid action");
  }
}

import { looksLikeEmail } from "@/lib/committees/looksLikeEmail";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ClaimOpenRouteInput = {
  deliveryId: string;
  name: string;
  email: string;
  address: string;
};

export type ClaimOpenRouteResult =
  | {
      ok: true;
      routeName: string;
      leafletTitle: string;
      createdPerson: boolean;
    }
  | { ok: false; status: number; error: string };

async function findOrCreateDeliverer(
  supabase: Awaited<ReturnType<typeof getSupabaseForLeafletRoutes>>,
  params: { name: string; email: string; address: string },
): Promise<{ personId: string; created: boolean } | { error: string }> {
  const email = params.email.toLowerCase();

  const { data: existing } = await supabase
    .from("people")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (existing?.id) {
    const patch: { address: string } = { address: params.address };
    const { error } = await supabase.from("people").update(patch).eq("id", existing.id);
    if (error) return { error: error.message };
    return { personId: existing.id as string, created: false };
  }

  const { data: created, error } = await supabase
    .from("people")
    .insert({
      full_name: params.name,
      email,
      address: params.address,
      source: "open-route-signup",
    })
    .select("id")
    .single();

  if (error || !created) {
    const { data: raced } = await supabase
      .from("people")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    if (raced?.id) {
      await supabase.from("people").update({ address: params.address }).eq("id", raced.id);
      return { personId: raced.id as string, created: false };
    }
    return { error: error?.message ?? "Failed to create person" };
  }

  return { personId: created.id as string, created: true };
}

export async function claimOpenRoute(input: ClaimOpenRouteInput): Promise<ClaimOpenRouteResult> {
  const deliveryId = input.deliveryId.trim();
  const name = input.name.trim();
  const email = input.email.trim();
  const address = input.address.trim();

  if (!UUID_RE.test(deliveryId)) {
    return { ok: false, status: 400, error: "Invalid route" };
  }
  if (!name || !email || !address) {
    return { ok: false, status: 400, error: "Name, email, and address are required" };
  }
  if (!looksLikeEmail(email)) {
    return { ok: false, status: 400, error: "Enter a valid email address" };
  }

  const supabase = await getSupabaseForLeafletRoutes();

  const { data: leaflet, error: leafletError } = await supabase
    .from("leaflets")
    .select("id, title")
    .eq("status", "active")
    .maybeSingle();

  if (leafletError) {
    return { ok: false, status: 500, error: leafletError.message };
  }
  if (!leaflet) {
    return { ok: false, status: 409, error: "There is no active Leaflet right now" };
  }

  const { data: delivery, error: deliveryError } = await supabase
    .from("deliveries")
    .select("id, person_id, is_skipped, route_id, routes ( route_name )")
    .eq("id", deliveryId)
    .eq("leaflet_id", leaflet.id)
    .maybeSingle();

  if (deliveryError) {
    return { ok: false, status: 500, error: deliveryError.message };
  }
  if (!delivery) {
    return { ok: false, status: 404, error: "That route is not available" };
  }

  const stillOpen = !delivery.person_id || delivery.is_skipped;
  if (!stillOpen) {
    return { ok: false, status: 409, error: "Someone already signed up for this route" };
  }

  const personResult = await findOrCreateDeliverer(supabase, { name, email, address });
  if ("error" in personResult) {
    return { ok: false, status: 500, error: personResult.error };
  }

  const { data: updated, error: updateError } = await supabase
    .from("deliveries")
    .update({
      person_id: personResult.personId,
      is_skipped: false,
      response: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", deliveryId)
    .eq("leaflet_id", leaflet.id)
    .or("person_id.is.null,is_skipped.eq.true")
    .select("id, route_id")
    .maybeSingle();

  if (updateError) {
    return { ok: false, status: 500, error: updateError.message };
  }
  if (!updated) {
    return { ok: false, status: 409, error: "Someone already signed up for this route" };
  }

  if (typeof updated.route_id === "string") {
    const { error: routeError } = await supabase
      .from("routes")
      .update({
        primary_deliverer_id: personResult.personId,
        primary_deliverer_email: email.toLowerCase(),
      })
      .eq("id", updated.route_id);
    if (routeError) {
      return { ok: false, status: 500, error: routeError.message };
    }
  }

  const routeRaw = delivery.routes as { route_name?: string | null } | { route_name?: string | null }[] | null;
  const routeName = Array.isArray(routeRaw)
    ? routeRaw[0]?.route_name?.trim()
    : routeRaw?.route_name?.trim();

  return {
    ok: true,
    routeName: routeName || "this route",
    leafletTitle: leaflet.title,
    createdPerson: personResult.created,
  };
}

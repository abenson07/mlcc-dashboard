import type { SupabaseClient } from "@supabase/supabase-js";
import type { Leaflets, LeafletsInsert } from "@/types/database";

const DEFAULT_QR_URL =
  process.env.NEXT_PUBLIC_MEMBERSHIP_JOIN_URL?.trim() ||
  "https://mapleleafcommunity.org/join";

function editionSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function membershipQrUrl(title: string): string {
  const url = new URL(DEFAULT_QR_URL);
  const slug = editionSlug(title);
  if (slug) url.searchParams.set("source", `leaflet-${slug}`);
  return url.href;
}

export async function createLeaflet(
  supabase: SupabaseClient,
  input: Pick<LeafletsInsert, "title" | "distribution_date">,
): Promise<Leaflets> {
  const { data: qr, error: qrError } = await supabase
    .from("qr_codes")
    .insert({
      name: `${input.title} membership QR`,
      url: membershipQrUrl(input.title),
    })
    .select()
    .single();

  if (qrError || !qr) {
    throw new Error(qrError?.message ?? "Failed to create QR code");
  }

  const { data: leaflet, error: leafletError } = await supabase
    .from("leaflets")
    .insert({
      title: input.title,
      distribution_date: input.distribution_date,
      status: "planned",
      membership_qr_code_id: qr.id,
    })
    .select()
    .single();

  if (leafletError || !leaflet) {
    throw new Error(leafletError?.message ?? "Failed to create leaflet");
  }

  const { data: routes, error: routesError } = await supabase
    .from("routes")
    .select("*");

  if (routesError) {
    throw new Error(routesError.message);
  }

  if (routes?.length) {
    const deliveryRows = routes.map((route) => ({
      leaflet_id: leaflet.id,
      route_id: route.id,
      person_id: route.primary_deliverer_id,
      leaflet_count: route.leaflet_count,
      is_skipped: false,
      response: "pending" as const,
      building_contact_name: route.building_contact_name,
      building_contact_email: route.building_contact_email,
      building_contact_phone: route.building_contact_phone,
      building_contact_is_deliverer: route.building_contact_is_deliverer ?? false,
    }));

    const { error: deliveriesError } = await supabase
      .from("deliveries")
      .insert(deliveryRows);

    if (deliveriesError) {
      throw new Error(deliveriesError.message);
    }
  }

  const { data: taskTemplates, error: templatesError } = await supabase
    .from("task_templates")
    .select("*")
    .eq("context", "leaflet")
    .eq("is_active", true)
    .is("event_template_id", null);

  if (templatesError) {
    throw new Error(templatesError.message);
  }

  if (taskTemplates?.length) {
    const tasks = taskTemplates.map((t) => ({
      context: "leaflet" as const,
      context_id: leaflet.id,
      template_id: t.id,
      title: t.title,
      description: t.description,
      offset_days: t.offset_days,
    }));

    const { error: tasksError } = await supabase.from("tasks").insert(tasks);
    if (tasksError) {
      throw new Error(tasksError.message);
    }
  }

  const { data: prevClosed } = await supabase
    .from("leaflets")
    .select("id")
    .eq("status", "closed")
    .order("distribution_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (prevClosed?.id) {
    const { data: prevSponsorships } = await supabase
      .from("sponsorships")
      .select("*")
      .eq("leaflet_id", prevClosed.id);

    if (prevSponsorships?.length) {
      const copied = prevSponsorships.map((s) => ({
        business_id: s.business_id,
        leaflet_id: leaflet.id,
        event_id: null,
        amount: s.amount,
        status: "pledged" as const,
        memo: s.memo,
        description: s.description,
        image_url: s.image_url,
        quantity: s.quantity ?? 1,
      }));

      const { error: sponsorError } = await supabase
        .from("sponsorships")
        .insert(copied);

      if (sponsorError) {
        throw new Error(sponsorError.message);
      }
    }
  }

  return leaflet;
}

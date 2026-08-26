import type { SupabaseClient } from "@supabase/supabase-js";
import { isSponsorshipTierPlaceholder, type SponsorshipTierSeed } from "@/lib/sponsorship/tierPlaceholders";
import {
  spawnLeafletSponsorshipTiers,
  tierPlaceholderRows,
} from "@/lib/leaflets/spawnLeafletSponsorshipTiers";
import type { CommSettings, Leaflets, LeafletsInsert } from "@/types/database";
import {
  LEAFLET_COMM_STEP_DEFS,
  isLeafletPipelineStep,
  snapshotCommSchedule,
} from "@/lib/leaflets/comm/commSchedule";

const MEMBERSHIP_QR_BASE = "https://mapleleafcommunity.org/membership";
const OPEN_ROUTES_QR_URL = "https://mapleleafcommunity.org/leaflet/open-routes";

function editionSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function membershipQrUrl(title: string): string {
  const url = new URL(MEMBERSHIP_QR_BASE);
  url.searchParams.set("utm_source", "leaflet");
  const slug = editionSlug(title);
  if (slug) url.searchParams.set("utm_campaign", slug);
  return url.href;
}

export async function createLeaflet(
  supabase: SupabaseClient,
  input: Pick<LeafletsInsert, "title" | "distribution_date"> & {
    sponsorship_due_date?: string | null;
    delivery_date?: string | null;
    sponsorship_goal_cents?: number | null;
    tierOverrides?: SponsorshipTierSeed[];
  },
): Promise<Leaflets> {
  const { data: membershipQr, error: membershipQrError } = await supabase
    .from("qr_codes")
    .insert({
      name: `${input.title} membership QR`,
      url: membershipQrUrl(input.title),
    })
    .select()
    .single();

  if (membershipQrError || !membershipQr) {
    throw new Error(membershipQrError?.message ?? "Failed to create membership QR code");
  }

  const { data: openRoutesQr, error: openRoutesQrError } = await supabase
    .from("qr_codes")
    .insert({
      name: `${input.title} open routes QR`,
      url: OPEN_ROUTES_QR_URL,
    })
    .select()
    .single();

  if (openRoutesQrError || !openRoutesQr) {
    throw new Error(openRoutesQrError?.message ?? "Failed to create open routes QR code");
  }

  const { data: commSettings } = await supabase
    .from("comm_settings")
    .select("step_key, offset_days, is_enabled")
    .eq("context", "leaflet")
    .is("event_template_id", null);

  const scheduleSteps =
    (commSettings as Pick<CommSettings, "step_key" | "offset_days" | "is_enabled">[] | null)
      ?.filter((row) => row.is_enabled !== false && isLeafletPipelineStep(row.step_key)) ??
    LEAFLET_COMM_STEP_DEFS;

  const comm_schedule = snapshotCommSchedule(scheduleSteps, input.distribution_date);

  const { data: leaflet, error: leafletError } = await supabase
    .from("leaflets")
    .insert({
      title: input.title,
      distribution_date: input.distribution_date,
      sponsorship_due_date: input.sponsorship_due_date ?? null,
      delivery_date: input.delivery_date ?? null,
      sponsorship_goal_cents: input.sponsorship_goal_cents ?? null,
      status: "planned",
      membership_qr_code_id: membershipQr.id,
      open_routes_qr_code_id: openRoutesQr.id,
      comm_schedule,
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
      const tierPlaceholders = prevSponsorships.filter(isSponsorshipTierPlaceholder);
      const actualSponsors = prevSponsorships.filter(
        (s) => !isSponsorshipTierPlaceholder(s) && s.business_id,
      );

      if (input.tierOverrides?.length) {
        const { error: tierError } = await supabase
          .from("sponsorships")
          .insert(tierPlaceholderRows(leaflet.id, input.tierOverrides));
        if (tierError) throw new Error(tierError.message);
      } else if (tierPlaceholders.length) {
        const { error: tierError } = await supabase
          .from("sponsorships")
          .insert(tierPlaceholderRows(leaflet.id, tierPlaceholders.map((s) => ({
            name: s.description ?? "Sponsor",
            amount: s.amount ?? 0,
            quantity: s.quantity ?? 1,
          }))));
        if (tierError) throw new Error(tierError.message);
      } else {
        await spawnLeafletSponsorshipTiers(supabase, leaflet.id, input.tierOverrides);
      }

      if (actualSponsors.length) {
        const copied = actualSponsors.map((s) => ({
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

        const { error: sponsorError } = await supabase.from("sponsorships").insert(copied);
        if (sponsorError) throw new Error(sponsorError.message);
      }
    } else {
      await spawnLeafletSponsorshipTiers(supabase, leaflet.id, input.tierOverrides);
    }
  } else {
    await spawnLeafletSponsorshipTiers(supabase, leaflet.id, input.tierOverrides);
  }

  return leaflet;
}

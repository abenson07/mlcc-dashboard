import type { SupabaseClient } from "@supabase/supabase-js";
import type { Deliveries, Leaflets, People, Routes } from "@/types/database";
import { getResend, getResendFromEmail } from "@/lib/resend";
import { getAppOrigin } from "@/lib/leaflets/getAppOrigin";
import { buildOpenRouteEmailHtml } from "@/lib/leaflets/buildOpenRouteEmailHtml";

type DeliveryRow = Deliveries & {
  routes?: Routes | null;
};

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function loadDelivery(
  supabase: SupabaseClient,
  leafletId: string,
  deliveryId: string,
): Promise<DeliveryRow> {
  const { data, error } = await supabase
    .from("deliveries")
    .select(`*, routes (*)`)
    .eq("id", deliveryId)
    .eq("leaflet_id", leafletId)
    .single();
  if (error || !data) throw new Error(error?.message ?? "Delivery not found");
  return data as DeliveryRow;
}

async function loadPerson(supabase: SupabaseClient, personId: string): Promise<People> {
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("id", personId)
    .single();
  if (error || !data) throw new Error(error?.message ?? "Person not found");
  return data as People;
}

async function loadLeaflet(supabase: SupabaseClient, leafletId: string): Promise<Leaflets> {
  const { data, error } = await supabase
    .from("leaflets")
    .select("*")
    .eq("id", leafletId)
    .single();
  if (error || !data) throw new Error(error?.message ?? "Leaflet not found");
  return data as Leaflets;
}

export async function sendOpenRouteEmail(params: {
  supabase: SupabaseClient;
  leafletId: string;
  deliveryId: string;
  personId: string;
  message?: string;
  origin?: string;
}) {
  const resend = getResend();
  const from = getResendFromEmail();
  if (!resend || !from) throw new Error("Resend is not configured");

  const [leaflet, delivery, person] = await Promise.all([
    loadLeaflet(params.supabase, params.leafletId),
    loadDelivery(params.supabase, params.leafletId, params.deliveryId),
    loadPerson(params.supabase, params.personId),
  ]);

  const email = person.email?.trim();
  if (!email) throw new Error("Past deliverer has no email address");

  const routeName = delivery.routes?.route_name ?? "this route";
  const origin = params.origin ?? getAppOrigin();
  const volunteerUrl =
    process.env.NEXT_PUBLIC_MEMBERSHIP_JOIN_URL?.trim() ||
    "https://mapleleafcommunity.org/join";

  const html = buildOpenRouteEmailHtml({
    delivererName: person.full_name,
    leafletTitle: leaflet.title,
    distributionDate: formatDate(leaflet.distribution_date),
    routeName,
    householdCount: delivery.leaflet_count,
    customMessage: params.message,
    volunteerUrl,
    dashboardUrl: `${origin.replace(/\/$/, "")}/leaflet/open-routes?leaflet=${params.leafletId}`,
    coverSheetUrl: `${origin.replace(/\/$/, "")}/api/leaflets/${params.leafletId}/deliveries/${params.deliveryId}/cover-sheet`,
  });

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `Can you deliver ${routeName}? — ${leaflet.title}`,
    html,
  });
  if (error) throw new Error(error.message);

  return { sent: true, to: email, routeName };
}

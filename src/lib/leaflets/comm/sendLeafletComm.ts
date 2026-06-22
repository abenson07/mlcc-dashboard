import type { SupabaseClient } from "@supabase/supabase-js";
import type { CommSettings, Deliveries, Leaflets, People, Routes } from "@/types/database";
import { getResend, getResendFromEmail } from "@/lib/resend";
import { buildRespondUrl } from "@/lib/leaflets/signRespondUrl";
import { buildLeafletCommEmailHtml } from "@/lib/leaflets/comm/buildLeafletCommEmailHtml";

type DeliveryRow = Deliveries & {
  routes?: Routes | null;
  people?: People | null;
};

const LEAFLET_STAMP_COLUMNS: Record<string, keyof Leaflets> = {
  initial_confirmation: "comm_initial_confirmation_sent_at",
  distribution_day_pickup: "comm_distribution_day_pickup_sent_at",
  delivery_complete_prompt: "comm_delivery_complete_prompt_sent_at",
};

const DELIVERY_STAMP_COLUMNS: Record<string, keyof Deliveries> = {
  pre_distribution_reminder: "comm_pre_distribution_reminder_sent_at",
  completion_followup: "comm_completion_followup_sent_at",
};

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function loadSetting(supabase: SupabaseClient, stepKey: string) {
  const { data, error } = await supabase
    .from("comm_settings")
    .select("*")
    .eq("context", "leaflet")
    .eq("step_key", stepKey)
    .is("event_template_id", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error(`Unknown comm step: ${stepKey}`);
  return data as CommSettings;
}

async function loadLeaflet(supabase: SupabaseClient, leafletId: string) {
  const { data, error } = await supabase
    .from("leaflets")
    .select("*")
    .eq("id", leafletId)
    .single();
  if (error || !data) throw new Error(error?.message ?? "Leaflet not found");
  return data as Leaflets;
}

async function loadDeliveries(supabase: SupabaseClient, leafletId: string) {
  const { data, error } = await supabase
    .from("deliveries")
    .select(
      `
      *,
      routes (*),
      people!deliveries_person_id_fkey (*)
    `,
    )
    .eq("leaflet_id", leafletId);
  if (error) throw new Error(error.message);
  return (data ?? []) as DeliveryRow[];
}

function groupByPerson(deliveries: DeliveryRow[]) {
  const map = new Map<string, { person: People; deliveries: DeliveryRow[] }>();
  for (const d of deliveries) {
    if (!d.person_id || !d.people) continue;
    const existing = map.get(d.person_id);
    if (existing) existing.deliveries.push(d);
    else map.set(d.person_id, { person: d.people, deliveries: [d] });
  }
  return map;
}

async function sendDelivererEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResend();
  const from = getResendFromEmail();
  if (!resend || !from) throw new Error("Resend is not configured");

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
  if (error) throw new Error(error.message);
}

async function sendToDeliverer(params: {
  setting: CommSettings;
  leaflet: Leaflets;
  leafletId: string;
  origin: string;
  person: People;
  personDeliveries: DeliveryRow[];
}) {
  const email = params.person.email?.trim();
  if (!email) return false;

  const primaryDelivery = params.personDeliveries[0]!;
  const confirmUrl = buildRespondUrl(params.origin, {
    leafletId: params.leafletId,
    personId: params.person.id,
    deliveryId: primaryDelivery.id,
  });
  const distributionDate = formatDate(params.leaflet.distribution_date);
  const routeLines = params.personDeliveries.map((d) => {
    const name = d.routes?.route_name ?? "Route";
    const count = d.leaflet_count != null ? ` (${d.leaflet_count} households)` : "";
    return `${name}${count}`;
  });

  await sendDelivererEmail({
    to: email,
    subject: `Confirm your routes — ${params.leaflet.title}`,
    html: buildLeafletCommEmailHtml({
      delivererName: params.person.full_name,
      leafletTitle: params.leaflet.title,
      distributionDate,
      routeLines,
      confirmUrl,
    }),
  });
  return true;
}

export async function sendLeafletComm(params: {
  supabase: SupabaseClient;
  leafletId: string;
  stepKey: string;
  origin: string;
}) {
  const setting = await loadSetting(params.supabase, params.stepKey);
  if (!setting.is_enabled) throw new Error("This comm step is disabled");
  if (setting.resend_template_id.startsWith("placeholder_")) {
    throw new Error("Resend template is not configured for this step");
  }

  const leafletColumn = LEAFLET_STAMP_COLUMNS[params.stepKey];
  const deliveryColumn = DELIVERY_STAMP_COLUMNS[params.stepKey];
  if (!leafletColumn && !deliveryColumn) {
    throw new Error(`Unsupported comm step: ${params.stepKey}`);
  }

  const leaflet = await loadLeaflet(params.supabase, params.leafletId);
  const deliveries = await loadDeliveries(params.supabase, params.leafletId);
  const now = new Date().toISOString();
  let sent = 0;

  const groups = groupByPerson(
    deliveries.filter((d) => d.person_id && d.people?.email),
  );

  for (const { person, deliveries: personDeliveries } of groups.values()) {
    const didSend = await sendToDeliverer({
      setting,
      leaflet,
      leafletId: params.leafletId,
      origin: params.origin,
      person,
      personDeliveries,
    });
    if (!didSend) continue;

    sent++;

    if (deliveryColumn) {
      const ids = personDeliveries.map((d) => d.id);
      const { error } = await params.supabase
        .from("deliveries")
        .update({ [deliveryColumn]: now, updated_at: now })
        .in("id", ids);
      if (error) throw new Error(error.message);
    }
  }

  if (leafletColumn) {
    const { error } = await params.supabase
      .from("leaflets")
      .update({ [leafletColumn]: now, updated_at: now })
      .eq("id", params.leafletId);
    if (error) throw new Error(error.message);
  }

  return { sent, stepKey: params.stepKey };
}

/** Resend a leaflet comm step to one deliverer (does not re-stamp edition-wide sent_at). */
export async function resendLeafletCommToPerson(params: {
  supabase: SupabaseClient;
  leafletId: string;
  personId: string;
  stepKey?: string;
  origin: string;
}) {
  const stepKey = params.stepKey ?? "initial_confirmation";
  const setting = await loadSetting(params.supabase, stepKey);
  if (!setting.is_enabled) throw new Error("This comm step is disabled");
  if (setting.resend_template_id.startsWith("placeholder_")) {
    throw new Error("Resend template is not configured for this step");
  }

  const leaflet = await loadLeaflet(params.supabase, params.leafletId);
  const deliveries = await loadDeliveries(params.supabase, params.leafletId);
  const personDeliveries = deliveries.filter((d) => d.person_id === params.personId);
  if (personDeliveries.length === 0) {
    throw new Error("No deliveries found for this deliverer");
  }

  const person = personDeliveries[0]!.people;
  if (!person) throw new Error("Deliverer not found");

  const didSend = await sendToDeliverer({
    setting,
    leaflet,
    leafletId: params.leafletId,
    origin: params.origin,
    person,
    personDeliveries,
  });
  if (!didSend) throw new Error("Deliverer has no email address");

  return { sent: 1, stepKey, personId: params.personId };
}

export function unconfirmedRecipientCount(deliveries: DeliveryRow[]): number {
  const people = new Set<string>();
  for (const d of deliveries) {
    if (d.person_id && d.response !== "confirmed") people.add(d.person_id);
  }
  return people.size;
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Events, EventsInsert } from "@/types/database";
import { parseEventFieldData } from "./eventData";
import { buildEventQrUrl, eventPageUrl, withEventQrLinks } from "./eventQr";
import { activateEventResources } from "./spawnEventResources";

function eventSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type CreateEventInput = Pick<
  EventsInsert,
  "name" | "starts_at" | "ends_at" | "event_template_id"
> & {
  field_data?: Record<string, unknown>;
};

export async function createEvent(
  supabase: SupabaseClient,
  input: CreateEventInput,
): Promise<Events> {
  const name = input.name?.trim() ?? "";
  if (!name) throw new Error("name is required");

  let mergedFieldData: Record<string, unknown> = { ...(input.field_data ?? {}) };

  if (input.event_template_id) {
    const { data: template, error: templateError } = await supabase
      .from("event_templates")
      .select("default_field_data")
      .eq("id", input.event_template_id)
      .maybeSingle();

    if (templateError) throw new Error(templateError.message);
    if (template?.default_field_data && typeof template.default_field_data === "object") {
      mergedFieldData = {
        ...(template.default_field_data as Record<string, unknown>),
        ...mergedFieldData,
      };
    }
  }

  const slugBase = eventSlug(name);
  const slug = slugBase ? `${slugBase}-${Date.now().toString(36)}` : null;

  const legacyDate = input.starts_at ? input.starts_at.slice(0, 10) : null;

  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      name,
      starts_at: input.starts_at ?? null,
      ends_at: input.ends_at ?? null,
      event_template_id: input.event_template_id ?? null,
      date: legacyDate,
      slug,
      field_data: mergedFieldData,
    })
    .select()
    .single();

  if (eventError || !event) {
    throw new Error(eventError?.message ?? "Failed to create event");
  }

  const fieldData = parseEventFieldData(event.field_data);

  if (input.event_template_id) {
    await activateEventResources(supabase, event as Events);
  }

  if (!fieldData.qr_code_id && !fieldData.qr_codes?.length && slug) {
    const pageUrl = eventPageUrl(slug);
    if (!pageUrl) return event as Events;

    const qrUrl = buildEventQrUrl({
      baseUrl: pageUrl,
      campaign: slug,
      content: "event-page",
    });
    const { data: qr, error: qrError } = await supabase
      .from("qr_codes")
      .insert({
        name: `${name} event QR`,
        url: qrUrl,
      })
      .select()
      .single();

    if (!qrError && qr) {
      const nextFieldData = withEventQrLinks(mergedFieldData, [
        { id: qr.id, description: "Default event page QR" },
      ]);
      const { error: updateError } = await supabase
        .from("events")
        .update({ field_data: nextFieldData })
        .eq("id", event.id);

      if (!updateError) {
        return { ...event, field_data: nextFieldData };
      }
    }
  }

  return event as Events;
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Events, EventsInsert } from "@/types/database";
import { parseEventFieldData } from "./eventData";

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
    let templateQuery = supabase
      .from("task_templates")
      .select("*")
      .eq("context", "event")
      .eq("is_active", true)
      .eq("event_template_id", input.event_template_id);

    const { data: taskTemplates, error: templatesError } = await templateQuery;

    if (templatesError) throw new Error(templatesError.message);

    if (taskTemplates?.length) {
      const tasks = taskTemplates.map((t) => ({
        context: "event" as const,
        context_id: event.id,
        template_id: t.id,
        title: t.title,
        description: t.description,
        offset_days: t.offset_days,
      }));

      const { error: tasksError } = await supabase.from("tasks").insert(tasks);
      if (tasksError) throw new Error(tasksError.message);
    }
  }

  if (!fieldData.qr_code_id && slug) {
    const publicUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      "https://mapleleafcommunity.org";
    const { data: qr, error: qrError } = await supabase
      .from("qr_codes")
      .insert({
        name: `${name} event QR`,
        url: `${publicUrl}/events/${slug}`,
      })
      .select()
      .single();

    if (!qrError && qr) {
      const { error: updateError } = await supabase
        .from("events")
        .update({
          field_data: { ...mergedFieldData, qr_code_id: qr.id },
        })
        .eq("id", event.id);

      if (!updateError) {
        return { ...event, field_data: { ...mergedFieldData, qr_code_id: qr.id } };
      }
    }
  }

  return event as Events;
}

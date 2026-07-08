import type { SupabaseClient } from "@supabase/supabase-js";
import type { Events } from "@/types/database";

import { parseEventFieldData } from "./eventData";

import { composeEventMarketingCopy } from "@/lib/marketing/composeEventCopy";
import { getEventVoiceToneMarkdown } from "@/lib/marketing/eventVoiceTone";

export async function publishEvent(supabase: SupabaseClient, event: Events): Promise<Events> {
  const { data: updated, error } = await supabase
    .from("events")
    .update({ publish_status: "published" })
    .eq("id", event.id)
    .select()
    .single();

  if (error || !updated) {
    throw new Error(error?.message ?? "Failed to publish event");
  }

  try {
    const fieldData = parseEventFieldData(updated.field_data);

    const copy = await composeEventMarketingCopy({
      eventName: updated.name ?? "",
      startsAt: updated.starts_at ?? "",
      endsAt: updated.ends_at ?? undefined,
      locationLabel: fieldData.location,
      committeeName: fieldData.committee,
      isExternal: fieldData.kind === "external",
      voiceToneMarkdown: getEventVoiceToneMarkdown(),
    });

    const mergedFieldData = {
      ...fieldData,
      marketing: {
        shortDescription: copy.shortDescription,
        body: copy.body,
        generatedAt: new Date().toISOString(),
      },
    };

    const { data: withMarketing } = await supabase
      .from("events")
      .update({ field_data: mergedFieldData })
      .eq("id", event.id)
      .select()
      .single();

    return (withMarketing as Events) ?? (updated as Events);
  } catch (err) {
    console.error("[publishEvent] marketing draft generation failed", err);
    return updated as Events;
  }
}

export async function unpublishEvent(supabase: SupabaseClient, eventId: string): Promise<Events> {
  const { data, error } = await supabase
    .from("events")
    .update({ publish_status: "draft" })
    .eq("id", eventId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to unpublish event");
  }

  return data as Events;
}

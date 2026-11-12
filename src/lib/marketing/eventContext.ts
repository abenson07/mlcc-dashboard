import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import { eventPageUrl } from "@/lib/events/eventQr";
import type { SocialEventFacts } from "@/lib/marketing/composeSocialCopy";

export type LoadedEvent = SocialEventFacts & {
  id: string;
  /** Event start instant, ISO. */
  startsAt: string;
};

/** Event facts for outreach copy, from our own data so links and dates are never model-generated. */
export async function loadEventContext(eventId: string): Promise<LoadedEvent | null> {
  const supabase = await getSupabaseForLeafletRoutes();
  const { data, error } = await supabase
    .from("events")
    .select("id, name, starts_at, slug, publish_status, field_data")
    .eq("id", eventId)
    .maybeSingle();
  if (error || !data || !data.starts_at) return null;

  const fieldData = (data.field_data ?? {}) as { location?: unknown };
  const location = typeof fieldData.location === "string" ? fieldData.location : undefined;
  return {
    id: data.id as string,
    name: (data.name as string | null) ?? "Event",
    startsAt: data.starts_at as string,
    locationLabel: location,
    // Only link to the public page once the event is actually published.
    url: data.publish_status === "published" ? eventPageUrl(data.slug as string | null) : null,
  };
}

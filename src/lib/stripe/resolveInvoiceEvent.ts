import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

export type ResolvedInvoiceEvent = {
  eventId: string;
  eventName: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Resolve an event id to stored invoice metadata (server-side; do not trust client names). */
export async function resolveInvoiceEventById(
  eventId: string
): Promise<
  { ok: true; event: ResolvedInvoiceEvent } | { ok: false; error: string }
> {
  const id = eventId.trim();
  if (!id) {
    return { ok: false, error: "eventId is required for event sponsorship invoices." };
  }

  const supabase = await getSupabaseForLeafletRoutes();

  if (UUID_RE.test(id)) {
    const { data, error } = await supabase
      .from("events")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      return { ok: false, error: error.message };
    }
    if (data) {
      return {
        ok: true,
        event: {
          eventId: data.id,
          eventName: (data.name ?? "").trim() || "Untitled event",
        },
      };
    }
  }

  const { data, error } = await supabase
    .from("events")
    .select("id, name")
    .filter("field_data->>webflow_item_id", "eq", id)
    .maybeSingle();
  if (error) {
    return { ok: false, error: error.message };
  }
  if (!data) {
    return { ok: false, error: "Selected event was not found." };
  }

  return {
    ok: true,
    event: {
      eventId: data.id,
      eventName: (data.name ?? "").trim() || "Untitled event",
    },
  };
}

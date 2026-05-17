import {
  fetchEventsCollection,
  getEventsEnv,
  listAllEventItems,
  pickTitleFieldSlug,
} from "@/lib/webflow/eventsWorkspace";

export type ResolvedInvoiceEvent = {
  eventId: string;
  eventName: string;
};

/** Resolve a Webflow event id to stored invoice metadata (server-side; do not trust client names). */
export async function resolveInvoiceEventById(
  eventId: string
): Promise<
  { ok: true; event: ResolvedInvoiceEvent } | { ok: false; error: string }
> {
  const id = eventId.trim();
  if (!id) {
    return { ok: false, error: "eventId is required for event sponsorship invoices." };
  }

  const env = getEventsEnv();
  if (!env) {
    return {
      ok: false,
      error:
        "Webflow events are not configured; cannot attach an event to this invoice.",
    };
  }

  const [collection, items] = await Promise.all([
    fetchEventsCollection(env.token, env.collectionId),
    listAllEventItems(env.token, env.collectionId),
  ]);

  const item = items.find((row) => row.id === id);
  if (!item || item.isArchived) {
    return { ok: false, error: "Selected event was not found." };
  }

  const titleSlug = pickTitleFieldSlug(collection.fields);
  const fd = item.fieldData ?? {};
  const eventName = String(fd[titleSlug] ?? fd.name ?? "Untitled event").trim();

  return {
    ok: true,
    event: {
      eventId: id,
      eventName: eventName || "Untitled event",
    },
  };
}

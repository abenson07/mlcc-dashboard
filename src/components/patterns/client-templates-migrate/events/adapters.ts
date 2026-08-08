import type { EventListItem } from "@/lib/events/eventData";
import type { EventSummary } from "@/data/mocks/events";

export function toEventSummary(row: EventListItem): EventSummary {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    location: row.location,
    // Real events have no category concept — fixed placeholder since EventCategory is a closed union.
    category: "Community",
    description: "",
  };
}

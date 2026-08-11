"use client";

import { DraftsSection } from "@/components/patterns/client-templates/drafts";
import { EventCard } from "./EventCard";
import { sampleEvents } from "@/data/mocks/events";

/** Events body — stacked list of upcoming event cards, mirroring Action Items. */
export function EventsListPage() {
  return (
    <DraftsSection title="Upcoming Events" columns={1}>
      {sampleEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </DraftsSection>
  );
}

"use client";

import { useMemo } from "react";
import { useEvents } from "hooks";
import { DraftsSection } from "@/components/patterns/client-templates/drafts";
import { Text } from "@/components/patterns/primitives/Text";
import { EventCard } from "./EventCard";
import { toEventSummary } from "./adapters";

/** Events body — stacked list of upcoming event cards, mirroring Action Items. */
export function EventsListPage() {
  const { events, loading, error } = useEvents();
  const summaries = useMemo(() => events.map(toEventSummary), [events]);

  if (error) {
    return <Text color="secondary">Couldn&apos;t load events: {error}</Text>;
  }
  if (loading) {
    return <Text color="secondary">Loading…</Text>;
  }

  return (
    <DraftsSection title="Upcoming Events" columns={1}>
      {summaries.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </DraftsSection>
  );
}

"use client";

import { useMemo } from "react";
import { useEvents } from "hooks";
import { DraftsSection } from "@/components/patterns/client-templates/drafts";
import { Text } from "@/components/patterns/primitives/Text";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { sampleEvents } from "@/data/mocks/events";
import { EventCard } from "./EventCard";
import { toEventSummary } from "./adapters";

/** Events body — stacked list of upcoming event cards, mirroring Action Items. */
export function EventsListPage() {
  const { enabled: demo } = useDemoModeOptional();
  const { events, loading, error } = useEvents();
  const summaries = useMemo(
    () => (demo ? sampleEvents : events.map(toEventSummary)),
    [demo, events],
  );

  if (!demo && error) {
    return <Text color="secondary">Couldn&apos;t load events: {error}</Text>;
  }
  if (!demo && loading) {
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

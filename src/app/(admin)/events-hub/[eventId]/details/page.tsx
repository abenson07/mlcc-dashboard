"use client";

import EventDetailsContent from "@/components/integrated/events/EventDetailsContent";
import CommitteeMeetingDetailsContent from "@/components/integrated/events/CommitteeMeetingDetailsContent";
import { useEventContext } from "@/components/integrated/events/EventContext";

export default function EventDetailsPage() {
  const { event } = useEventContext();
  if (event?.kind === "committee_meeting") {
    return <CommitteeMeetingDetailsContent />;
  }
  return <EventDetailsContent />;
}

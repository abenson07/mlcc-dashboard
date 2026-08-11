"use client";

import CommitteeMeetingDetailsContent from "@/components/integrated/events/CommitteeMeetingDetailsContent";
import EventDetailsPanel from "@/components/integrated/events/EventDetailsPanel";
import { useEventContext } from "@/components/integrated/events/EventContext";

export default function ShellPreviewEventDetailsPage() {
  const { event } = useEventContext();

  if (event?.kind === "committee_meeting") {
    return <CommitteeMeetingDetailsContent />;
  }

  return <EventDetailsPanel />;
}

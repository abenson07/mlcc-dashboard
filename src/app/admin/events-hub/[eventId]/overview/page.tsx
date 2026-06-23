"use client";

"use client";

import EventOverviewPageContent from "@/components/integrated/events/EventOverviewPageContent";
import CommitteeMeetingOverviewContent from "@/components/integrated/events/CommitteeMeetingOverviewContent";
import { useEventContext } from "@/components/integrated/events/EventContext";

export default function EventOverviewPage() {
  const { event } = useEventContext();
  if (event?.kind === "committee_meeting") {
    return <CommitteeMeetingOverviewContent />;
  }
  return <EventOverviewPageContent />;
}

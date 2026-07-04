"use client";

import CommitteeMeetingOverviewContent from "@/components/integrated/events/CommitteeMeetingOverviewContent";
import EventOverviewPageContent from "@/components/integrated/events/EventOverviewPageContent";
import { useEventContext } from "@/components/integrated/events/EventContext";

export default function ShellPreviewEventOverviewPage() {
  const { event } = useEventContext();

  if (event?.kind === "committee_meeting") {
    return <CommitteeMeetingOverviewContent />;
  }

  return <EventOverviewPageContent />;
}

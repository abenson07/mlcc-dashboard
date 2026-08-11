import { Suspense } from "react";
import EventsListPageContent from "@/components/integrated/events/EventsListPageContent";

export default function ShellPreviewEventsPage() {
  return (
    <Suspense fallback={<p className="lf-meta">Loading events…</p>}>
      <EventsListPageContent embedded />
    </Suspense>
  );
}

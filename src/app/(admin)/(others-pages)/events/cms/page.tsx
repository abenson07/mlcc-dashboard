import { Suspense } from "react";
import EventsHub from "@/components/events/EventsHub";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events CMS",
  description: "Webflow Events CMS",
};

export default function EventsCmsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}>
      <EventsHub />
    </Suspense>
  );
}

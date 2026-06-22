"use client";

import { use } from "react";
import { IconPlus } from "@/components/leaflet/icons";
import EventSidebar from "@/components/integrated/events/EventSidebar";
import IntegratedTopbar from "@/components/integrated/IntegratedTopbar";

export default function EventDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);

  return (
    <>
      <IntegratedTopbar
        primaryAction={
          <button type="button" className="lf-btn lf-btn--outline">
            <IconPlus />
            New event
          </button>
        }
      />
      <div className="lf-main">
        <div className="lf-sidebar-col">
          <EventSidebar eventId={eventId} />
        </div>
        <div className="lf-content-col">
          <main className="lf-canvas">{children}</main>
        </div>
      </div>
    </>
  );
}

"use client";

import { IconPlus } from "@/components/leaflet/icons";
import IntegratedTopbar from "../IntegratedTopbar";
import EventSidebar from "./EventSidebar";
import type { ReactNode } from "react";

type EventPageShellProps = {
  eventId: string;
  children: ReactNode;
};

export default function EventPageShell({ eventId, children }: EventPageShellProps) {
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

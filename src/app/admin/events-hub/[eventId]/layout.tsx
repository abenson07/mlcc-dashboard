"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useEvents } from "hooks";
import { IconPlus } from "@/components/leaflet/icons";
import EventSidebar from "@/components/integrated/events/EventSidebar";
import IntegratedTopbar from "@/components/integrated/IntegratedTopbar";
import CreateEventModal from "@/components/integrated/events/CreateEventModal";
import { EventProvider } from "@/components/integrated/events/EventContext";

export default function EventDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const { create } = useEvents();

  async function handleCreate(input: Parameters<typeof create>[0]) {
    const event = await create(input);
    router.push(`/admin/events-hub/${event.id}/overview`);
  }

  return (
    <EventProvider eventId={eventId}>
      <IntegratedTopbar
        primaryAction={
          <button
            type="button"
            className="lf-btn lf-btn--outline"
            onClick={() => setCreateOpen(true)}
          >
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
      <CreateEventModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </EventProvider>
  );
}

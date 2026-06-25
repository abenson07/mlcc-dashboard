"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEvents } from "hooks";
import { IconCalendarNav, IconChevronDown, IconLayoutDashboard } from "@/components/leaflet/icons";
import SidebarFooterNav from "../SidebarFooterNav";

export default function EventsListSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedEvent = searchParams.get("event");
  const onEventsList = pathname === "/admin/events";
  const { events, loading } = useEvents();

  const councilEvents = events.filter(
    (event) => event.kind === "council" && event.status.toLowerCase() !== "completed",
  );
  const committeeMeetings = events.filter(
    (event) => event.kind === "committee_meeting" && event.status.toLowerCase() !== "completed",
  );
  const externalEvents = events.filter((event) => event.kind === "external");

  const sidebarGroups = [
    {
      label: "Upcoming Council Events",
      items: councilEvents,
      hrefFor: (id: string) => `/admin/events-hub/${id}/overview` as const,
      isCouncil: true,
    },
    {
      label: "Upcoming Committee Meetings",
      items: committeeMeetings,
      hrefFor: (id: string) => `/admin/events-hub/${id}/overview` as const,
      isCouncil: true,
    },
    {
      label: "Upcoming External Events",
      items: externalEvents,
      hrefFor: (id: string) => `/admin/events?event=${id}` as const,
      isCouncil: false,
    },
  ] as const;

  return (
    <aside className="lf-sidebar">
      <nav className="lf-sidebar-nav" aria-label="Events sections">
        <Link
          href="/admin/events"
          className={onEventsList && !selectedEvent ? "lf-nav-item lf-nav-item--active" : "lf-nav-item"}
        >
          <IconLayoutDashboard />
          Overview
        </Link>

        {loading && <p className="lf-meta" style={{ padding: "8px 12px" }}>Loading…</p>}

        {sidebarGroups.map((group) => (
          <div key={group.label}>
            <div className="lf-nav-section-header">
              <span>{group.label}</span>
              <IconChevronDown />
            </div>
            {group.items.map((event) => {
              const href = group.hrefFor(event.id);
              const isActive = group.isCouncil
                ? pathname?.startsWith(`/admin/events-hub/${event.id}`)
                : onEventsList && selectedEvent === event.id;

              return (
                <Link
                  key={event.id}
                  href={href}
                  className={isActive ? "lf-nav-item lf-nav-item--active" : "lf-nav-item"}
                >
                  <IconCalendarNav />
                  {event.title}
                </Link>
              );
            })}
          </div>
        ))}

        <SidebarFooterNav />
      </nav>
    </aside>
  );
}

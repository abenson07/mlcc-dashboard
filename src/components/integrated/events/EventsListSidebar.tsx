"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { IconCalendarNav, IconChevronDown, IconLayoutDashboard } from "@/components/leaflet/icons";
import SidebarSettingsNavItem from "../SidebarSettingsNavItem";
import { MOCK_EVENTS } from "../mockData";

const COUNCIL_EVENTS = MOCK_EVENTS.filter((event) => event.kind === "council" && event.status !== "Completed");
const EXTERNAL_EVENTS = MOCK_EVENTS.filter((event) => event.kind === "external");

const SIDEBAR_GROUPS = [
  { label: "Upcoming Council Events", items: COUNCIL_EVENTS, hrefFor: (id: string) => `/events-hub/${id}/overview` as const },
  { label: "Upcoming External Events", items: EXTERNAL_EVENTS, hrefFor: (id: string) => `/events?event=${id}` as const },
] as const;

export default function EventsListSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedEvent = searchParams.get("event");
  const onEventsList = pathname === "/events";

  return (
    <aside className="lf-sidebar">
      <nav className="lf-sidebar-nav" aria-label="Events sections">
        <Link
          href="/events"
          className={onEventsList && !selectedEvent ? "lf-nav-item lf-nav-item--active" : "lf-nav-item"}
        >
          <IconLayoutDashboard />
          Overview
        </Link>

        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="lf-nav-section-header">
              <span>{group.label}</span>
              <IconChevronDown />
            </div>
            {group.items.map((event) => {
              const href = group.hrefFor(event.id);
              const isActive =
                group.label === "Upcoming Council Events"
                  ? pathname?.startsWith(`/events-hub/${event.id}`)
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

        <div className="lf-nav-spacer" />
        <SidebarSettingsNavItem />
      </nav>
    </aside>
  );
}

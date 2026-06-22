"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconCalendarCheck,
  IconHandshake,
  IconLayoutDashboard,
  IconMegaphone,
  IconUser,
} from "@/components/leaflet/icons";
import { getEventById } from "../mockData";

const EVENT_NAV = [
  { label: "Overview", href: "overview", icon: IconLayoutDashboard },
  { label: "Event details", href: "details", icon: IconCalendarCheck },
  { label: "Sponsorship", href: "sponsorship", icon: IconHandshake },
  { label: "Volunteers", href: "volunteers", icon: IconUser },
  { label: "Marketing", href: "marketing", icon: IconMegaphone },
  { label: "Schedule", href: "schedule", icon: IconCalendarCheck },
] as const;

export default function EventSidebar({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const event = getEventById(eventId);

  return (
    <aside className="lf-sidebar">
      <div className="lf-selector">
        <button type="button" className="lf-selector-trigger">
          <span className="lf-selector-title">{event.title}</span>
        </button>
      </div>
      <nav className="lf-sidebar-nav" aria-label="Event sections">
        <p className="lf-nav-section">Manage event</p>
        {EVENT_NAV.map(({ label, href, icon: Icon }) => {
          const fullHref = `/events-hub/${eventId}/${href}`;
          const active = pathname?.startsWith(fullHref);
          return (
            <Link
              key={href}
              href={fullHref}
              className={active ? "lf-nav-item lf-nav-item--active" : "lf-nav-item"}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
        <div className="lf-nav-spacer" />
        <button type="button" className="lf-nav-item lf-nav-item--muted">
          Event settings
        </button>
      </nav>
    </aside>
  );
}

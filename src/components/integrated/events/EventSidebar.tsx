"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconCalendarNav,
  IconFileTextNav,
  IconHandshake,
  IconLayoutDashboard,
  IconLifeBuoy,
  IconMegaphoneNav,
  IconUsers,
} from "@/components/leaflet/icons";
import SidebarSettingsNavItem from "../SidebarSettingsNavItem";
import EventSelector from "./EventSelector";
import { useEventContext } from "./EventContext";

const EVENT_NAV = [
  { label: "Overview", href: "overview", icon: IconLayoutDashboard },
  { label: "Event details", href: "details", icon: IconFileTextNav },
  { label: "Sponsorship", href: "sponsorship", icon: IconHandshake },
  { label: "Volunteers", href: "volunteers", icon: IconUsers },
  { label: "Marketing", href: "marketing", icon: IconMegaphoneNav },
  { label: "Schedule", href: "schedule", icon: IconCalendarNav },
] as const;

const COMMITTEE_NAV = [
  { label: "Overview", href: "overview", icon: IconLayoutDashboard },
  { label: "Meeting details", href: "details", icon: IconFileTextNav },
] as const;

export default function EventSidebar({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const { event } = useEventContext();
  const isCommitteeMeeting = event?.kind === "committee_meeting";
  const navItems = isCommitteeMeeting ? COMMITTEE_NAV : EVENT_NAV;

  return (
    <>
      <EventSelector eventId={eventId} />
      <aside className="lf-sidebar">
        <nav className="lf-sidebar-nav" aria-label="Event sections">
          {navItems.map(({ label, href, icon: Icon }) => {
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
          <button type="button" className="lf-nav-item lf-nav-item--help">
            <IconLifeBuoy />
            Event guide
          </button>
          <SidebarSettingsNavItem />
        </nav>
      </aside>
    </>
  );
}

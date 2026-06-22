"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBike,
  IconCalendarCheck,
  IconHandshake,
  IconLayoutDashboard,
  IconMap,
  IconRepeat,
  IconRoute,
} from "./icons";
import { leafletHref, useLeafletContext } from "./LeafletContext";

const DELIVERY_NAV = [
  { label: "Deliverers", href: "/leaflet/deliverers", icon: IconBike },
  { label: "Routes", href: "/leaflet/routes", icon: IconMap },
  { label: "Open Routes", href: "/leaflet/open-routes", icon: IconRoute },
  { label: "Substitutions", href: "/leaflet/substitutions", icon: IconRepeat },
] as const;

const SUPPORT_NAV = [
  { label: "Sponsorships", href: "/leaflet/sponsorships", icon: IconHandshake },
  { label: "To-do / Schedule", href: "/leaflet/todo", icon: IconCalendarCheck },
] as const;

export default function LeafletSidebar() {
  const pathname = usePathname();
  const { leafletId } = useLeafletContext();
  const overviewActive = pathname === "/leaflet";

  return (
    <aside className="lf-sidebar">
      <nav className="lf-sidebar-nav" aria-label="Leaflet sections">
        <Link
          href={leafletHref("/leaflet", leafletId)}
          className={overviewActive ? "lf-nav-item lf-nav-item--active" : "lf-nav-item"}
        >
          <IconLayoutDashboard />
          Overview
        </Link>

        <div className="lf-nav-spacer" />

        <p className="lf-nav-section">Delivery</p>
        {DELIVERY_NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={leafletHref(href, leafletId)}
            className={pathname?.startsWith(href) ? "lf-nav-item lf-nav-item--active" : "lf-nav-item"}
          >
            <Icon />
            {label}
          </Link>
        ))}

        <p className="lf-nav-section">Support</p>
        {SUPPORT_NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={leafletHref(href, leafletId)}
            className={
              pathname?.startsWith(href)
                ? "lf-nav-item lf-nav-item--active"
                : "lf-nav-item"
            }
          >
            <Icon />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

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
import SidebarFooterNav from "@/components/integrated/SidebarFooterNav";

const DELIVERY_NAV = [
  { label: "Deliverers", href: "/old-admin/leaflet/deliverers", icon: IconBike },
  { label: "Routes", href: "/old-admin/leaflet/routes", icon: IconMap },
  { label: "Open Routes", href: "/old-admin/leaflet/open-routes", icon: IconRoute },
  { label: "Skipped Routes", href: "/old-admin/leaflet/substitutions", icon: IconRepeat },
] as const;

const SUPPORT_NAV = [
  { label: "Sponsorships", href: "/old-admin/leaflet/sponsorships", icon: IconHandshake },
  { label: "To-do / Schedule", href: "/old-admin/leaflet/todo", icon: IconCalendarCheck },
] as const;

export default function LeafletSidebar() {
  const pathname = usePathname();
  const { leafletId } = useLeafletContext();
  const overviewActive = pathname === "/old-admin/leaflet";

  return (
    <aside className="lf-sidebar">
      <nav className="lf-sidebar-nav" aria-label="Leaflet sections">
        <Link
          href={leafletHref("/old-admin/leaflet", leafletId)}
          className={overviewActive ? "lf-nav-item lf-nav-item--active" : "lf-nav-item"}
        >
          <IconLayoutDashboard />
          Overview
        </Link>

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
        <SidebarFooterNav />
      </nav>
    </aside>
  );
}

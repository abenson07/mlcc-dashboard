"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconUser } from "@/components/leaflet/icons";

const PEOPLE_NAV = [
  { label: "All people", href: "/people", icon: IconUser },
  { label: "All households", href: "/people?filter=households", icon: IconUser },
] as const;

const FILTER_GROUPS = [
  {
    label: "Supported by me",
    items: ["Members", "Volunteers", "Donors", "Contacted members"],
  },
  {
    label: "Supporter groups",
    items: ["Business owners", "Schools", "Business outreach"],
  },
] as const;

export default function PeopleSidebar() {
  const pathname = usePathname();

  return (
    <aside className="lf-sidebar">
      <nav className="lf-sidebar-nav" aria-label="People sections">
        {PEOPLE_NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? "lf-nav-item lf-nav-item--active" : "lf-nav-item"}
          >
            <Icon />
            {label}
          </Link>
        ))}

        {FILTER_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="lf-nav-section">{group.label}</p>
            {group.items.map((item) => (
              <button key={item} type="button" className="lf-nav-item">
                {item}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

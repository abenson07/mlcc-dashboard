"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  IconBriefcase,
  IconBuilding,
  IconChevronDown,
  IconCopy,
  IconHandshake,
  IconHeartHandshake,
  IconIdCard,
  IconMailNav,
  IconMegaphoneNav,
  IconUsers,
} from "@/components/leaflet/icons";
import SidebarFooterNav from "../SidebarFooterNav";
import { isBusinessFilter, isPeopleSubFilter, parsePeopleFilter } from "./peopleFilters";

const PEOPLE_NAV = [
  { label: "All neighbors", href: "/people", icon: IconUsers, filter: null },
  {
    label: "All businesses",
    href: "/people?filter=businesses",
    icon: IconBuilding,
    filter: "businesses",
  },
] as const;

const FILTER_GROUPS = [
  {
    label: "Supporting neighbors",
    items: [
      { label: "Members", filter: "members", icon: IconIdCard, comingSoon: false },
      { label: "Volunteers", filter: "volunteers", icon: IconHeartHandshake, comingSoon: false },
      { label: "Email list", filter: "email-list", icon: IconMailNav, comingSoon: true },
      { label: "Duplicate members", filter: "duplicates", icon: IconCopy, comingSoon: true },
    ],
  },
  {
    label: "Supporting businesses",
    items: [
      { label: "Business members", filter: "business-members", icon: IconBriefcase, comingSoon: false },
      { label: "Sponsors", filter: "sponsors", icon: IconHandshake, comingSoon: false },
      {
        label: "Business outreach",
        filter: "business-outreach",
        icon: IconMegaphoneNav,
        comingSoon: false,
      },
    ],
  },
] as const;

function isAllNeighborsActive(activeFilter: string | null): boolean {
  return !activeFilter || isPeopleSubFilter(parsePeopleFilter(activeFilter));
}

function isAllBusinessesActive(activeFilter: string | null): boolean {
  return isBusinessFilter(parsePeopleFilter(activeFilter));
}

export default function PeopleSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get("filter");

  return (
    <aside className="lf-sidebar">
      <nav className="lf-sidebar-nav" aria-label="People sections">
        {PEOPLE_NAV.map(({ label, href, icon: Icon, filter }) => {
          const isActive =
            pathname === "/people" &&
            (filter === null
              ? isAllNeighborsActive(activeFilter)
              : isAllBusinessesActive(activeFilter));
          return (
            <Link
              key={href}
              href={href}
              className={isActive ? "lf-nav-item lf-nav-item--active" : "lf-nav-item"}
            >
              <Icon />
              {label}
            </Link>
          );
        })}

        {FILTER_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="lf-nav-section-header">
              <span>{group.label}</span>
              <IconChevronDown />
            </div>
            {group.items.map(({ label, filter, icon: Icon, comingSoon }) => {
              if (comingSoon) {
                return (
                  <span
                    key={filter}
                    className="lf-nav-item lf-nav-item--disabled"
                    aria-disabled="true"
                  >
                    <Icon />
                    {label}
                    <span className="lf-nav-badge">Coming soon</span>
                  </span>
                );
              }

              const href = `/people?filter=${filter}`;
              const isActive = pathname === "/people" && activeFilter === filter;
              return (
                <Link
                  key={filter}
                  href={href}
                  className={isActive ? "lf-nav-item lf-nav-item--active" : "lf-nav-item"}
                >
                  <Icon />
                  {label}
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

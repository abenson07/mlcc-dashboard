"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { IconChevronDown, IconDollar, IconPlus, IconVolume } from "@/components/leaflet/icons";

export type DashboardMode = "Site" | "People" | "Events" | "Leaflets" | "Stories";

const MODE_TABS: { label: DashboardMode; href: string; dividerAfter: boolean }[] = [
  { label: "Site", href: "/site", dividerAfter: false },
  { label: "People", href: "/people", dividerAfter: false },
  { label: "Events", href: "/events-hub", dividerAfter: true },
  { label: "Leaflets", href: "/leaflet", dividerAfter: true },
  { label: "Stories", href: "/stories", dividerAfter: false },
];

function modeFromPath(pathname: string | null): DashboardMode {
  if (pathname?.startsWith("/people")) return "People";
  if (pathname?.startsWith("/events-hub")) return "Events";
  if (pathname?.startsWith("/leaflet")) return "Leaflets";
  if (pathname?.startsWith("/stories")) return "Stories";
  return "Site";
}

type IntegratedTopbarProps = {
  center?: ReactNode;
  primaryAction?: ReactNode;
};

export default function IntegratedTopbar({ center, primaryAction }: IntegratedTopbarProps) {
  const pathname = usePathname();
  const activeMode = modeFromPath(pathname);

  return (
    <header className="lf-topbar">
      <nav className="lf-modes" aria-label="Dashboard mode">
        {MODE_TABS.map((tab) => {
          const isActive = tab.label === activeMode;
          return (
            <span key={tab.label} className="lf-mode-wrap">
              <Link
                href={tab.href}
                className={isActive ? "lf-mode lf-mode--active" : "lf-mode lf-mode--inactive lf-mode--link"}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </Link>
              {tab.dividerAfter && <span className="lf-mode-divider" aria-hidden />}
            </span>
          );
        })}
      </nav>

      {center ? <div className="lf-topbar-center">{center}</div> : <div className="lf-topbar-spacer" />}

      <div className="lf-topbar-controls">
        <Link href="/finance" className={`lf-icon-btn${pathname?.startsWith("/finance") ? " lf-icon-btn--active" : ""}`} aria-label="Revenue dashboard">
          <IconDollar />
        </Link>
        <button type="button" className="lf-icon-btn lf-icon-btn--promo" aria-label="Promotion menu">
          <IconVolume />
          <IconChevronDown />
        </button>
        {primaryAction ?? (
          <button type="button" className="lf-btn lf-btn--outline">
            <IconPlus />
            New
          </button>
        )}
      </div>
    </header>
  );
}

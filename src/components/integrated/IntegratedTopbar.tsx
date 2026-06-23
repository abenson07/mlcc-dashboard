"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import ActionItemsTopbarMenu from "./ActionItemsTopbarMenu";
import {
  IconChevronDown,
  IconDollar,
  IconPanelTop,
  IconPlus,
  IconVolume,
} from "@/components/leaflet/icons";

export type DashboardMode = "Site" | "People" | "Events" | "Leaflets" | "Stories";

const MODE_TABS: { label: DashboardMode; href: string; dividerAfter: boolean }[] = [
  { label: "Site", href: "/site", dividerAfter: false },
  { label: "People", href: "/people", dividerAfter: false },
  { label: "Events", href: "/events", dividerAfter: true },
  { label: "Leaflets", href: "/leaflet", dividerAfter: true },
  { label: "Stories", href: "/stories", dividerAfter: false },
];

const PROMO_ITEMS = [
  { label: "General promotion", icon: IconVolume },
  { label: "Banner", icon: IconPanelTop },
] as const;

function isIntegratedEventsPath(pathname: string | null) {
  if (!pathname) return false;
  if (pathname === "/events" || pathname.startsWith("/events?")) return true;
  return pathname.startsWith("/events-hub");
}

function modeFromPath(pathname: string | null): DashboardMode {
  if (pathname?.startsWith("/people") || pathname?.startsWith("/biz")) return "People";
  if (isIntegratedEventsPath(pathname)) return "Events";
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
  const [promoOpen, setPromoOpen] = useState(false);
  const promoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!promoOpen) return;
    function handleClick(event: MouseEvent) {
      if (promoRef.current && !promoRef.current.contains(event.target as Node)) {
        setPromoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [promoOpen]);

  return (
    <header className={center ? "lf-topbar lf-topbar--with-center" : "lf-topbar"}>
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

      {center ? <div className="lf-topbar-center">{center}</div> : null}

      <div className="lf-topbar-controls">
        <ActionItemsTopbarMenu />
        <Link
          href="/finance"
          className={`lf-icon-btn${pathname?.startsWith("/finance") ? " lf-icon-btn--active" : ""}`}
          aria-label="Revenue dashboard"
        >
          <IconDollar />
        </Link>
        <div className="lf-promo-menu" ref={promoRef}>
          <button
            type="button"
            className="lf-icon-btn lf-icon-btn--promo"
            aria-label="Promotion menu"
            aria-expanded={promoOpen}
            onClick={() => setPromoOpen((open) => !open)}
          >
            <IconVolume />
            <IconChevronDown />
          </button>
          {promoOpen ? (
            <div className="lf-promo-dropdown" role="menu">
              {PROMO_ITEMS.map(({ label, icon: Icon }) => (
                <button key={label} type="button" className="lf-promo-dropdown-item" role="menuitem">
                  <Icon />
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {primaryAction ?? (
          <button type="button" className="lf-btn lf-btn--outline">
            <IconPlus />
            New event
          </button>
        )}
      </div>
    </header>
  );
}

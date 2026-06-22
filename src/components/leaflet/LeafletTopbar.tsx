"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { IconPlus } from "@/components/leaflet/icons";
import CreateLeafletModal from "./overview/CreateLeafletModal";
import { useLeafletContext } from "./LeafletContext";

const MODE_TABS = [
  { label: "Site", href: "/site", dividerAfter: false },
  { label: "People", href: "/people", dividerAfter: false },
  { label: "Events", href: "/events", dividerAfter: true },
  { label: "Leaflets", href: "/leaflet", dividerAfter: true },
  { label: "Stories", href: "/stories", dividerAfter: false },
] as const;

export default function LeafletTopbar() {
  const pathname = usePathname();
  const { createLeaflet, setLeafletId } = useLeafletContext();
  const [modalOpen, setModalOpen] = useState(false);

  async function handleCreate(input: { title: string; distribution_date: string }) {
    const created = await createLeaflet(input);
    setLeafletId(created.id);
    toast.success("Leaflet created");
  }

  function isActive(href: string) {
    if (href === "/leaflet") return pathname?.startsWith("/leaflet");
    return pathname?.startsWith(href);
  }

  return (
    <header className="lf-topbar">
      <nav className="lf-modes" aria-label="Dashboard mode">
        {MODE_TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <span key={tab.label} className="lf-mode-wrap">
              <Link
                href={tab.href}
                className={active ? "lf-mode lf-mode--active" : "lf-mode lf-mode--inactive lf-mode--link"}
                aria-current={active ? "page" : undefined}
              >
                {tab.label}
              </Link>
              {tab.dividerAfter && <span className="lf-mode-divider" aria-hidden />}
            </span>
          );
        })}
      </nav>
      <div className="lf-topbar-spacer" />
      <div className="lf-topbar-controls">
        <Link href="/finance" className="lf-icon-btn" aria-label="Revenue dashboard">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </Link>
        <button type="button" className="lf-icon-btn lf-icon-btn--promo" aria-label="Promotion menu" onClick={() => toast.message("Promotion menu — wire up later")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" className="lf-btn lf-btn--outline" onClick={() => setModalOpen(true)}>
          <IconPlus />
          New leaflet
        </button>
      </div>
      <CreateLeafletModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </header>
  );
}

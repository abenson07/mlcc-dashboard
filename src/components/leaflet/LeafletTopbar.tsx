"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconChevronDown, IconDollar, IconPlus, IconVolume } from "./icons";
import { useLeafletContext } from "./LeafletContext";
import CreateLeafletModal from "./overview/CreateLeafletModal";

const MODE_TABS = [
  { label: "Site", dividerAfter: false },
  { label: "People", dividerAfter: false },
  { label: "Events", dividerAfter: true },
  { label: "Leaflets", dividerAfter: true },
  { label: "Stories", dividerAfter: false },
] as const;

export default function LeafletTopbar() {
  const { createLeaflet, setLeafletId } = useLeafletContext();
  const [modalOpen, setModalOpen] = useState(false);

  async function handleCreate(input: { title: string; distribution_date: string }) {
    const created = await createLeaflet(input);
    setLeafletId(created.id);
    toast.success("Leaflet created");
  }

  return (
    <header className="lf-topbar">
      <nav className="lf-modes" aria-label="Dashboard mode">
        {MODE_TABS.map((tab) => {
          const isActive = tab.label === "Leaflets";
          return (
            <span key={tab.label} className="lf-mode-wrap">
              <span
                className={isActive ? "lf-mode lf-mode--active" : "lf-mode lf-mode--inactive"}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </span>
              {tab.dividerAfter && <span className="lf-mode-divider" aria-hidden />}
            </span>
          );
        })}
      </nav>
      <div className="lf-topbar-controls">
        <button type="button" className="lf-icon-btn" aria-label="Revenue dashboard">
          <IconDollar />
        </button>
        <button type="button" className="lf-icon-btn lf-icon-btn--promo" aria-label="Promotion menu">
          <IconVolume />
          <IconChevronDown />
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

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconChevronsUpDown } from "./icons";
import { useLeafletContext } from "./LeafletContext";

function statusLabel(status: string) {
  if (status === "active") return "Active";
  if (status === "planned") return "Planned";
  if (status === "closed") return "Closed";
  return status;
}

export default function LeafletSelector() {
  const { leaflet, leaflets, setLeafletId } = useLeafletContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { current, otherActive, others } = useMemo(() => {
    const currentItem = leaflet;
    const active = leaflets.filter((l) => l.status === "active" && l.id !== currentItem?.id);
    const rest = leaflets.filter((l) => {
      if (l.id === currentItem?.id) return false;
      if (l.status === "active") return false;
      return true;
    });
    return { current: currentItem, otherActive: active, others: rest };
  }, [leaflet, leaflets]);

  const filteredOthers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return others;
    return others.filter(
      (l) => l.title.toLowerCase().includes(q) || l.distribution_date.includes(q),
    );
  }, [others, search]);

  return (
    <div className="lf-selector">
      <button type="button" className="lf-selector-trigger" onClick={() => setOpen((v) => !v)}>
        <span className="lf-selector-title">{current?.title ?? "No active leaflet"}</span>
        <IconChevronsUpDown />
      </button>

      {open && (
        <>
          <div className="lf-selector-backdrop" onClick={() => setOpen(false)} aria-hidden />
          <div className="lf-selector-menu">
            {current && (
              <button type="button" className="lf-selector-item" onClick={() => setOpen(false)}>
                <span className="font-medium">{current.title}</span>
                <span className="text-[var(--lf-text-muted)]">(current)</span>
              </button>
            )}
            {otherActive.map((l) => (
              <button
                key={l.id}
                type="button"
                className="lf-selector-item"
                onClick={() => {
                  setLeafletId(l.id);
                  setOpen(false);
                }}
              >
                {l.title}
                <span className="text-emerald-600">Active</span>
              </button>
            ))}
            {(otherActive.length > 0 || others.length > 0) && <div className="lf-selector-divider" />}
            <div className="lf-selector-search">
              <input
                type="search"
                placeholder="Search editions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {filteredOthers.map((l) => (
              <button
                key={l.id}
                type="button"
                className="lf-selector-item"
                onClick={() => {
                  setLeafletId(l.id);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <span className="font-medium">{l.title}</span>
                <span className="text-[var(--lf-text-muted)]">
                  {statusLabel(l.status)} · {l.distribution_date}
                </span>
              </button>
            ))}
            <div className="lf-selector-divider" />
            <Link
              href="/old-admin/leaflets"
              className="lf-selector-item"
              onClick={() => setOpen(false)}
            >
              See all leaflets
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

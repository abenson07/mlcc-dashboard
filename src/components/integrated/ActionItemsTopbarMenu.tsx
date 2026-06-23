"use client";

import { useEffect, useRef, useState } from "react";
import { COMMITTEE_LABELS } from "schemas/committee_meetings";
import type { CommitteeSlug } from "schemas/committee_meetings";
import { useMyActionItems } from "hooks";
import { usePeople } from "hooks";
import { IconCheckSquare } from "@/components/leaflet/icons";

export default function ActionItemsTopbarMenu() {
  const [open, setOpen] = useState(false);
  const [reassignId, setReassignId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const { items, openCount, loading, refetch, markDone, reassign } = useMyActionItems({
    autoFetch: true,
  });
  const { people } = usePeople({
    autoFetch: open && Boolean(reassignId),
    filters: { search: search.trim() || undefined },
  });

  useEffect(() => {
    if (!open) return;
    void refetch();
  }, [open, refetch]);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
        setReassignId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="lf-action-items-menu" ref={menuRef}>
      <button
        type="button"
        className={`lf-icon-btn${open ? " lf-icon-btn--active" : ""}`}
        aria-label="My action items"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <IconCheckSquare />
        {openCount > 0 && <span className="lf-action-items-badge">{openCount}</span>}
      </button>
      {open && (
        <div className="lf-action-items-dropdown" role="menu">
          <div className="lf-action-items-dropdown-header">
            <strong>My action items</strong>
            {openCount > 0 && <span className="lf-meta">{openCount} open</span>}
          </div>
          {loading && <p className="lf-meta" style={{ padding: "8px 10px" }}>Loading…</p>}
          {!loading && items.length === 0 && (
            <p className="lf-meta" style={{ padding: "8px 10px" }}>No open action items</p>
          )}
          {items.map((item) => {
            const meeting = item.committee_meetings;
            const committee = meeting?.committee as CommitteeSlug | undefined;
            const committeeLabel = committee ? COMMITTEE_LABELS[committee] : null;
            const eventName = meeting?.events?.name;

            return (
              <div key={item.id} className="lf-action-items-row">
                <label className="lf-action-items-check">
                  <input
                    type="checkbox"
                    onChange={() => void markDone(item.id)}
                  />
                </label>
                <div className="lf-action-items-row-body">
                  <span className="lf-action-items-title">{item.title}</span>
                  <span className="lf-meta">
                    {[committeeLabel, eventName, item.due_at ? `Due ${item.due_at}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                <button
                  type="button"
                  className="lf-btn lf-btn--ghost lf-btn--sm"
                  onClick={() => setReassignId(reassignId === item.id ? null : item.id)}
                >
                  Reassign
                </button>
                {reassignId === item.id && (
                  <div className="lf-reassign-popover lf-reassign-popover--dropdown">
                    <input
                      type="search"
                      className="lf-input"
                      placeholder="Search people…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {people.slice(0, 6).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="lf-mention-item"
                        onClick={() => {
                          void reassign(item.id, p.id).then(() => {
                            setReassignId(null);
                            setSearch("");
                          });
                        }}
                      >
                        {p.full_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { DeliveryWithRelations } from "hooks";

type AddRoutePickerProps = {
  openDeliveries: DeliveryWithRelations[];
  onSelect: (delivery: DeliveryWithRelations) => void | Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
  selecting?: boolean;
};

export default function AddRoutePicker({
  openDeliveries,
  onSelect,
  onCancel,
  disabled = false,
  selecting = false,
}: AddRoutePickerProps) {
  const [search, setSearch] = useState("");
  const trimmed = search.trim().toLowerCase();

  const candidates = useMemo(() => {
    const filtered = trimmed
      ? openDeliveries.filter((d) => (d.routes?.route_name ?? "").toLowerCase().includes(trimmed))
      : openDeliveries;
    return filtered.slice(0, 12);
  }, [openDeliveries, trimmed]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label className="lf-search" style={{ width: "100%" }}>
        <input
          type="search"
          placeholder="Search open routes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          disabled={disabled || selecting}
        />
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {openDeliveries.length === 0 && (
          <span className="lf-meta">No open routes available</span>
        )}
        {openDeliveries.length > 0 && candidates.length === 0 && (
          <span className="lf-meta">No matching routes</span>
        )}
        {candidates.map((d) => (
          <button
            key={d.id}
            type="button"
            className="lf-selector-item"
            style={{ borderRadius: 6 }}
            disabled={disabled || selecting}
            onClick={() => void onSelect(d)}
          >
            <span>
              {d.routes?.route_name ?? "—"}
              {d.routes?.route_type ? <span className="lf-meta"> · {d.routes.route_type}</span> : null}
            </span>
          </button>
        ))}
      </div>
      {onCancel && (
        <button
          type="button"
          className="lf-btn lf-btn--outline"
          style={{ alignSelf: "flex-start" }}
          disabled={disabled || selecting}
          onClick={onCancel}
        >
          Cancel
        </button>
      )}
    </div>
  );
}

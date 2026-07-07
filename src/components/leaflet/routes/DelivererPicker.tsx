"use client";

import { useMemo, useState } from "react";
import { usePeople } from "hooks";
import { outlineBtnStyle } from "../deliverers/actionButtonStyles";

type DelivererPickerProps = {
  onSelect: (person: { id: string; name: string; email: string | null }) => void | Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
  excludePersonId?: string | null;
  selecting?: boolean;
  placeholder?: string;
};

export default function DelivererPicker({
  onSelect,
  onCancel,
  disabled = false,
  excludePersonId = null,
  selecting = false,
  placeholder = "Search people…",
}: DelivererPickerProps) {
  const [search, setSearch] = useState("");
  const trimmed = search.trim();
  const { people, loading } = usePeople({
    autoFetch: trimmed.length > 0,
    filters: { search: trimmed || undefined },
  });

  const candidates = useMemo(
    () => people.filter((p) => p.id !== excludePersonId).slice(0, 12),
    [people, excludePersonId],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label className="lf-search" style={{ width: "100%" }}>
        <input
          type="search"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          disabled={disabled || selecting}
        />
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {trimmed.length === 0 && (
          <span className="lf-meta">Type a name or email to search</span>
        )}
        {loading && trimmed.length > 0 && <span className="lf-meta">Searching…</span>}
        {candidates.map((p) => (
          <button
            key={p.id}
            type="button"
            className="lf-selector-item"
            style={{ borderRadius: 6 }}
            disabled={disabled || selecting}
            onClick={() => void onSelect({ id: p.id, name: p.full_name, email: p.email })}
          >
            <span>
              {p.full_name}
              {p.email ? <span className="lf-meta"> · {p.email}</span> : null}
            </span>
          </button>
        ))}
        {trimmed.length > 0 && !loading && candidates.length === 0 && (
          <span className="lf-meta">No matching people</span>
        )}
      </div>
      {onCancel && (
        <button
          type="button"
          className="lf-btn lf-btn--outline"
          style={{ ...outlineBtnStyle, alignSelf: "flex-start" }}
          disabled={disabled || selecting}
          onClick={onCancel}
        >
          Cancel
        </button>
      )}
    </div>
  );
}

"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { DUPLICATE_PERSON_EMAIL, saveErrorMessage } from "@/lib/saveErrorMessage";

type Props = {
  label: string;
  value: string;
  icon: ReactNode;
  onCommit: (value: string) => Promise<void>;
};

export function EditableContactField({ label, value, icon, onCommit }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const canceled = useRef(false);
  const errorId = useId();

  function startEditing() {
    setDraft(value);
    setError(null);
    canceled.current = false;
    setEditing(true);
  }

  async function commit() {
    if (canceled.current || busy.current) return;
    if (draft.trim() === value.trim()) {
      setEditing(false);
      return;
    }
    busy.current = true;
    setSaving(true);
    setError(null);
    try {
      await onCommit(draft);
      setEditing(false);
    } catch (e) {
      setError(
        saveErrorMessage(e, {
          fallback: "Couldn't save contact details. Please try again.",
          duplicate: DUPLICATE_PERSON_EMAIL,
        }),
      );
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32, paddingInline: 4 }}>
        <span style={{ display: "inline-flex", color: "var(--linear-color-ink-subtle)" }}>{icon}</span>
        {editing ? (
          <input
            aria-label={label}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            type={label === "Phone" ? "tel" : "text"}
            value={draft}
            readOnly={saving}
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => void commit()}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                if (busy.current) return;
                canceled.current = true;
                setDraft(value);
                setError(null);
                setEditing(false);
              } else if (event.key === "Enter") {
                event.preventDefault();
                if (!event.nativeEvent.isComposing) void commit();
              }
            }}
            style={{
              boxSizing: "border-box",
              width: "100%",
              minWidth: 0,
              height: 32,
              paddingInline: 8,
              borderRadius: 6,
              border: "var(--linear-border-width) solid var(--linear-color-hairline)",
              background: "var(--linear-color-canvas)",
              color: "var(--linear-color-ink)",
              font: "inherit",
              fontSize: 13,
            }}
          />
        ) : (
          <button
            type="button"
            aria-label={`Edit ${label.toLowerCase()}`}
            title={`Double-click to edit ${label.toLowerCase()}, or press Enter`}
            onDoubleClick={startEditing}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                startEditing();
              }
            }}
            style={{
              all: "unset",
              cursor: "text",
              flex: 1,
              minWidth: 0,
              paddingBlock: 6,
              color: "var(--linear-color-ink-subtle)",
              fontSize: 13,
              overflowWrap: "anywhere",
            }}
          >
            {value || `Add ${label.toLowerCase()}`}
          </button>
        )}
      </div>
      {saving ? <span role="status" style={{ fontSize: 12 }}>Saving…</span> : null}
      {error ? <span id={errorId} role="alert" style={{ fontSize: 12, color: "var(--linear-color-ink)" }}>{error}</span> : null}
    </div>
  );
}

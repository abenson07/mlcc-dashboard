"use client";

import { useState } from "react";

type InlineDatePropertyProps = {
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  onSave: (raw: string) => void | Promise<void>;
};

function formatUsDate(iso: string): string {
  if (!iso) return "";
  // Accept date-only (YYYY-MM-DD) or full ISO timestamps from Postgres
  const dateOnly = iso.slice(0, 10);
  const d = /^\d{4}-\d{2}-\d{2}$/.test(dateOnly)
    ? new Date(`${dateOnly}T12:00:00`)
    : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function openDatePicker(e: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) {
  const el = e.currentTarget;
  try {
    el.showPicker?.();
  } catch {
    // ignore
  }
}

export default function InlineDateProperty({
  value,
  placeholder = "—",
  readOnly = false,
  onSave,
}: InlineDatePropertyProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  function startEditing() {
    setDraft(value);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
  }

  async function confirm(next = draft) {
    setSaving(true);
    try {
      await onSave(next);
      setEditing(false);
    } catch {
      // onSave surfaces errors
    } finally {
      setSaving(false);
    }
  }

  const display = formatUsDate(value);

  if (readOnly) {
    return <span className="shell-widget-property-static">{display || placeholder}</span>;
  }

  if (!editing) {
    return (
      <button
        type="button"
        className={`shell-widget-property-trigger${value ? "" : " shell-widget-property-trigger--placeholder"}`}
        onClick={startEditing}
      >
        {display || placeholder}
      </button>
    );
  }

  return (
    <input
      type="date"
      className="shell-widget-property-input cursor-pointer [&::-webkit-calendar-picker-indicator]:!block [&::-webkit-calendar-picker-indicator]:cursor-pointer"
      autoFocus
      disabled={saving}
      value={draft}
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        if (next) void confirm(next);
      }}
      onClick={openDatePicker}
      onFocus={openDatePicker}
      onBlur={() => {
        if (!saving) cancel();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") cancel();
      }}
    />
  );
}

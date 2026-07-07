"use client";

import { useState } from "react";

type InlineEditPropertyProps = {
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  inputMode?: "text" | "numeric";
  onSave: (raw: string) => void | Promise<void>;
};

export default function InlineEditProperty({
  value,
  placeholder = "—",
  readOnly = false,
  inputMode = "text",
  onSave,
}: InlineEditPropertyProps) {
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

  async function confirm() {
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } catch {
      // onSave is responsible for surfacing the error (toast); keep editing open so the user can retry.
    } finally {
      setSaving(false);
    }
  }

  if (readOnly) {
    return <span className="shell-widget-property-static">{value || placeholder}</span>;
  }

  if (!editing) {
    return (
      <button
        type="button"
        className={`shell-widget-property-trigger${value ? "" : " shell-widget-property-trigger--placeholder"}`}
        onClick={startEditing}
      >
        {value || placeholder}
      </button>
    );
  }

  return (
    <input
      type="text"
      inputMode={inputMode === "numeric" ? "numeric" : "text"}
      className="shell-widget-property-input"
      autoFocus
      disabled={saving}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={confirm}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        else if (e.key === "Escape") cancel();
      }}
    />
  );
}

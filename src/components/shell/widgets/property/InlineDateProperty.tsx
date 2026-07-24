"use client";

import { useState } from "react";
import DatePickerField from "@/components/form/DatePicker";

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

export default function InlineDateProperty({
  value,
  placeholder = "—",
  readOnly = false,
  onSave,
}: InlineDatePropertyProps) {
  const [saving, setSaving] = useState(false);

  async function handleChange(next: string) {
    if (!next) return;
    setSaving(true);
    try {
      await onSave(next);
    } finally {
      setSaving(false);
    }
  }

  if (readOnly) {
    return <span className="shell-widget-property-static">{formatUsDate(value) || placeholder}</span>;
  }

  return (
    <DatePickerField
      value={value.slice(0, 10)}
      onChange={handleChange}
      disabled={saving}
      placeholder={placeholder}
    />
  );
}

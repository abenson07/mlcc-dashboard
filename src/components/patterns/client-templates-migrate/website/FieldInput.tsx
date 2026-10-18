"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import type { FieldDef } from "@/lib/website/fields";
import { sanityImageUrl, websiteApi, type SanityImageValue } from "./api";
import { RichBodyField } from "./RichBodyField";
import { isoToZonedInput, zonedInputToIso } from "./zoned";

const control: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  height: 32,
  padding: "0 8px",
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
};

function ImageInput({ value, onChange, disabled }: { value: SanityImageValue | undefined; onChange: (next: SanityImageValue | "") => void; disabled?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const url = sanityImageUrl(value?.asset?._ref, 480);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const image = await websiteApi.upload(file);
      onChange({ ...image, alt: value?.alt });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={value?.alt ?? ""} style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8 }} />
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" disabled={disabled || busy} onClick={() => fileRef.current?.click()} style={{ ...control, width: "auto", padding: "0 12px", cursor: disabled ? "not-allowed" : "pointer" }}>
          {busy ? "Uploading…" : url ? "Replace image" : "Upload image"}
        </button>
        {url && !disabled && (
          <button type="button" onClick={() => onChange("")} style={{ ...control, width: "auto", padding: "0 12px", cursor: "pointer" }}>
            Remove
          </button>
        )}
      </div>
      {value?.asset && (
        <input
          style={control}
          placeholder="Alt text (describe the image)"
          value={value.alt ?? ""}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
        />
      )}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}

/** One field in the side form. Editors never see Sanity; this is the whole editing surface. */
export function FieldInput({
  field,
  value,
  onChange,
  disabled,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (next: unknown) => void;
  disabled?: boolean;
}) {
  switch (field.kind) {
    case "text":
    case "url":
      return <TextInput label={field.label} value={typeof value === "string" ? value : ""} onChange={onChange} />;
    case "textarea":
      return <TextInput label={field.label} value={typeof value === "string" ? value : ""} onChange={onChange} multiline rows={4} />;
    case "datetime":
      return (
        <input
          type="datetime-local"
          style={control}
          disabled={disabled}
          value={isoToZonedInput(typeof value === "string" ? value : undefined)}
          onChange={(e) => onChange(zonedInputToIso(e.target.value))}
        />
      );
    case "number":
      return (
        <input type="number" style={control} disabled={disabled} min={field.min} max={field.max} value={typeof value === "number" ? value : ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />
      );
    case "select":
      return (
        <select style={control} disabled={disabled} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
    case "boolean":
      return (
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <input type="checkbox" disabled={disabled} checked={value === true} onChange={(e) => onChange(e.target.checked)} />
          {field.label}
        </label>
      );
    case "image":
      return <ImageInput value={value as SanityImageValue | undefined} onChange={onChange} disabled={disabled} />;
    case "richtext":
      return <RichBodyField value={value} onChange={onChange} readOnly={disabled} />;
  }
}

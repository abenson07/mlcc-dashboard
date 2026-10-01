"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { uploadImage } from "./api";
import type { UploadedImage } from "./types";

export function OutreachImageSlot({
  image,
  onChange,
  demo,
  size = 88,
  label,
}: {
  image: UploadedImage | null | undefined;
  /** Called with the new image (or null when removed). */
  onChange: (next: UploadedImage | null) => void;
  demo: boolean;
  size?: number;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadImage(file, demo));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <button
          type="button"
          aria-label={image ? `Replace ${label}` : `Upload ${label}`}
          onClick={() => inputRef.current?.click()}
          style={{
            all: "unset",
            boxSizing: "border-box",
            cursor: "pointer",
            width: size,
            height: size,
            borderRadius: 8,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--linear-color-ink-subtle)",
            border: image
              ? "var(--linear-border-width) solid var(--linear-color-hairline)"
              : "var(--linear-border-width) dashed var(--linear-color-hairline-strong)",
            background: "var(--linear-color-canvas)",
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : busy ? (
            <span style={{ fontSize: 11 }}>Uploading…</span>
          ) : (
            <Upload size={18} strokeWidth={1.75} />
          )}
        </button>
        {image ? (
          <button
            type="button"
            aria-label={`Remove ${label}`}
            onClick={() => onChange(null)}
            style={{
              all: "unset",
              cursor: "pointer",
              position: "absolute",
              top: -6,
              right: -6,
              width: 18,
              height: 18,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--linear-color-ink)",
              color: "var(--linear-color-canvas)",
            }}
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>
      {error ? <span style={{ fontSize: 11, color: "#e5484d", maxWidth: size + 40 }}>{error}</span> : null}
    </div>
  );
}

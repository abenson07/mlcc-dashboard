"use client";

import { useState, type ReactNode } from "react";
import { Image as ImageIcon, MoreHorizontal, Pencil } from "lucide-react";

/** The ⋯ menu on a post preview: Edit content / Change image. */
export function PostMenu({ onEdit, onChangeImage }: { onEdit: () => void; onChangeImage: () => void }) {
  const [open, setOpen] = useState(false);
  const items: { label: string; icon: ReactNode; run: () => void }[] = [
    { label: "Edit content", icon: <Pencil size={14} />, run: onEdit },
    { label: "Change image", icon: <ImageIcon size={14} />, run: onChangeImage },
  ];
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        aria-label="Post options"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{ all: "unset", cursor: "pointer", padding: 4, color: "var(--linear-color-ink-subtle)" }}
      >
        <MoreHorizontal size={18} />
      </button>
      {open ? (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: 28,
            zIndex: 5,
            minWidth: 160,
            padding: 4,
            borderRadius: 8,
            background: "var(--linear-color-canvas)",
            border: "var(--linear-border-width) solid var(--linear-color-hairline)",
            boxShadow: "var(--linear-shadow-panel)",
          }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.run();
              }}
              style={{
                all: "unset",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "calc(100% - 16px)",
                padding: "6px 8px",
                borderRadius: 6,
                fontSize: 13,
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

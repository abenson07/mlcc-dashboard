"use client";

import { useState } from "react";
import { ChevronDown, Mail, X } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/patterns/shared/dropdown";
import { HoverTooltip } from "@/components/patterns/primitives/HoverTooltip";
import { IconButton } from "@/components/patterns/shared/IconButton";
import type { LeafletDelivererRow } from "@/data/mocks/leaflets";

const TOOLTIP_NAME_LIMIT = 20;

function namesTooltip(rows: LeafletDelivererRow[]): string {
  const names = rows.map((r) => r.name);
  if (names.length <= TOOLTIP_NAME_LIMIT) return names.join("\n");
  const rest = names.length - TOOLTIP_NAME_LIMIT;
  return `${names.slice(0, TOOLTIP_NAME_LIMIT).join("\n")}\nand ${rest} more`;
}

const barButton = {
  all: "unset",
  boxSizing: "border-box",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  height: 28,
  paddingInline: 10,
  borderRadius: "var(--linear-radius-md)",
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  whiteSpace: "nowrap",
} as const;

export type DeliverersBulkBarProps<S extends string> = {
  selected: LeafletDelivererRow[];
  statusOptions: { value: S; label: string }[];
  onSetStatus: (status: S) => void;
  onEmail: () => void;
  onClear: () => void;
};

/**
 * Floating action bar for a bulk deliverer selection. Sticks 32px above the
 * bottom of the scrolling canvas.
 */
export function DeliverersBulkBar<S extends string>({
  selected,
  statusOptions,
  onSetStatus,
  onEmail,
  onClear,
}: DeliverersBulkBarProps<S>) {
  const [statusOpen, setStatusOpen] = useState(false);
  const count = selected.length;
  if (count === 0) return null;

  return (
    <div
      style={{
        position: "sticky",
        bottom: 32,
        zIndex: 20,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        marginTop: "auto",
      }}
    >
      <div
        role="toolbar"
        aria-label="Selected deliverers"
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 44,
          paddingInline: "12px 6px",
          borderRadius: "var(--linear-radius-lg, 10px)",
          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          background: "var(--linear-color-canvas)",
          boxShadow: "var(--linear-shadow-panel)",
          boxSizing: "border-box",
        }}
      >
        <HoverTooltip content={namesTooltip(selected)}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--linear-color-ink)", whiteSpace: "nowrap" }}>
            {count} {count === 1 ? "person" : "people"} selected
          </span>
        </HoverTooltip>

        <span
          aria-hidden
          style={{ width: 1, height: 20, background: "var(--linear-color-hairline)", marginInline: 4 }}
        />

        <Dropdown
          label="Set status for selected deliverers"
          open={statusOpen}
          onOpenChange={setStatusOpen}
          placement="above"
          alignment="start"
          trigger={
            <button type="button" aria-haspopup="menu" aria-expanded={statusOpen} style={barButton}>
              Status
              <ChevronDown size={14} strokeWidth={1.75} style={{ color: "var(--linear-color-ink-subtle)" }} />
            </button>
          }
        >
          {statusOptions.map((option) => (
            <DropdownItem
              key={option.value}
              label={option.label}
              onSelect={() => {
                setStatusOpen(false);
                onSetStatus(option.value);
              }}
            />
          ))}
        </Dropdown>

        <button type="button" onClick={onEmail} style={barButton}>
          <Mail size={14} strokeWidth={1.75} style={{ color: "var(--linear-color-ink-subtle)" }} />
          Email
        </button>

        <IconButton
          label="Clear selection"
          variant="ghost"
          size="sm"
          icon={<X size={15} strokeWidth={1.75} />}
          onClick={onClear}
        />
      </div>
    </div>
  );
}

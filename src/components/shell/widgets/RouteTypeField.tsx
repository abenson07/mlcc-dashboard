"use client";

import { useState } from "react";
import { Command } from "cmdk";
import PropertyPopover from "./property/PropertyPopover";

export const ROUTE_TYPE_OPTIONS = ["Single family residences", "Apartments/Condos", "Businesses"];

type RouteTypeFieldProps = {
  value: string | null;
  readOnly?: boolean;
  onRequestChange: (nextType: string) => void;
};

export default function RouteTypeField({ value, readOnly = false, onRequestChange }: RouteTypeFieldProps) {
  const [open, setOpen] = useState(false);

  if (readOnly) {
    return <span className="shell-widget-property-static">{value || "—"}</span>;
  }

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <PropertyPopover
        open={open}
        onClose={() => setOpen(false)}
        trigger={
          <button
            type="button"
            className={`shell-widget-property-trigger${value ? "" : " shell-widget-property-trigger--placeholder"}`}
            onClick={() => setOpen((o) => !o)}
          >
            {value || "Select type"}
          </button>
        }
      >
        <Command>
          <Command.Input
            className="shell-widget-popover-search"
            placeholder="Search route type…"
            autoFocus
          />
          <Command.List className="shell-widget-popover-list">
            <Command.Empty className="shell-widget-popover-empty">No matching types</Command.Empty>
            {ROUTE_TYPE_OPTIONS.map((option) => (
              <Command.Item
                key={option}
                value={option}
                className="shell-widget-popover-item"
                onSelect={() => {
                  setOpen(false);
                  if (option !== value) onRequestChange(option);
                }}
              >
                <span className="shell-widget-popover-item-label">{option}</span>
                {value === option && <span className="shell-widget-popover-item-check">✓</span>}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </PropertyPopover>
    </div>
  );
}

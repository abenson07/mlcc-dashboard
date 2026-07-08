"use client";

import { useState } from "react";
import { Command } from "cmdk";
import PropertyPopover from "./property/PropertyPopover";
import { IconApartment, IconBusiness, IconCareFacility, IconHouse } from "./routeTypeIcons";

export const ROUTE_TYPE_OPTIONS = [
  { label: "Single family residences", icon: IconHouse },
  { label: "Condo/apartment", icon: IconApartment },
  { label: "Retirement home/care facility", icon: IconCareFacility },
  { label: "Business", icon: IconBusiness },
];

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
            {ROUTE_TYPE_OPTIONS.map(({ label, icon: Icon }) => (
              <Command.Item
                key={label}
                value={label}
                className="shell-widget-popover-item"
                onSelect={() => {
                  setOpen(false);
                  if (label !== value) onRequestChange(label);
                }}
              >
                <span className="shell-widget-popover-item-label">
                  <Icon />
                  {label}
                </span>
                {value === label && <span className="shell-widget-popover-item-check">✓</span>}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </PropertyPopover>
    </div>
  );
}

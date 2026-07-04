"use client";

import { useEffect, useRef } from "react";
import type { NavVariant } from "./NavPanelTypes";
import { NAV_VARIANT_LABELS } from "./navConfigs";

const VARIANTS: NavVariant[] = [
  "l1",
  "l1-dropdown",
  "settings",
  "event",
  "event-dropdown",
  "leaflet",
  "leaflet-dropdown",
];

type NavVariantContextMenuProps = {
  x: number;
  y: number;
  current: NavVariant;
  onSelect: (variant: NavVariant) => void;
  onClose: () => void;
};

export default function NavVariantContextMenu({
  x,
  y,
  current,
  onSelect,
  onClose,
}: NavVariantContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="shell-nav-variant-menu"
      style={{ top: y, left: x }}
      role="menu"
      aria-label="Navigation variant"
    >
      <p className="shell-nav-variant-menu-title">Navigation variant</p>
      {VARIANTS.map((variant) => (
        <button
          key={variant}
          type="button"
          role="menuitemradio"
          aria-checked={variant === current}
          className={`shell-nav-variant-menu-item${variant === current ? " shell-nav-variant-menu-item--active" : ""}`}
          onClick={() => onSelect(variant)}
        >
          {NAV_VARIANT_LABELS[variant]}
        </button>
      ))}
    </div>
  );
}

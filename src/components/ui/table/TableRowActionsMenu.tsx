"use client";

import React, { useRef, useState } from "react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

export type TableRowMenuItem = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
};

export function TableRowActionsMenu({ items }: { items: TableRowMenuItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  if (items.length === 0) return null;

  return (
    <div className="relative flex justify-end">
      <button
        ref={menuButtonRef}
        type="button"
        className="dropdown-toggle rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-white/10"
        aria-expanded={menuOpen}
        aria-label="More actions"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((o) => !o);
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>
      <Dropdown
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        className="min-w-[160px] py-1"
        anchorRef={menuButtonRef}
        usePortal
      >
        {items.map((item, i) => (
          <DropdownItem
            key={`${item.label}-${i}`}
            onItemClick={() => {
              if (!item.disabled) item.onClick();
              setMenuOpen(false);
            }}
            className={
              item.variant === "danger"
                ? "text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                : ""
            }
            baseClassName={
              item.disabled
                ? "block w-full cursor-not-allowed px-4 py-2 text-left text-sm text-gray-400"
                : undefined
            }
          >
            {item.label}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}

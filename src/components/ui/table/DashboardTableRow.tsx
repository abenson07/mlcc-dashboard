"use client";

import React, { ReactNode, KeyboardEvent, useRef, useEffect, useState } from "react";
import { TableRow, TableCell } from "./table-elements";
import { useDashboardTable } from "./dashboard-table-context";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

export interface DashboardTableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  /** Row selection checkbox (controlled). */
  checked?: boolean;
  onCheckChange?: () => void;
  /** Optional menu items; if omitted and showMenuColumn, a placeholder menu is still shown when menu is enabled at table level. */
  menuItems?: { label: string; onClick: () => void }[];
}

export function DashboardTableRow({
  children,
  className = "",
  onClick,
  selected = false,
  checked = false,
  onCheckChange,
  menuItems,
}: DashboardTableRowProps) {
  const { showSelectColumn, showMenuColumn } = useDashboardTable();
  const [menuOpen, setMenuOpen] = useState(false);

  const isClickable = typeof onClick === "function";

  const handleKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (!isClickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  const rowClass = `${className} ${selected ? "bg-blue-50/80 dark:bg-brand-500/10" : ""}`.trim();

  return (
    <TableRow
      onClick={onClick}
      className={rowClass}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {showSelectColumn && (
        <TableCell
          className="w-10 px-2 py-3.5 text-center align-middle bg-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="inline-flex cursor-pointer items-center justify-center">
            <input
              type="checkbox"
              className="size-3.5 rounded border-gray-300 text-brand-600 focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900"
              checked={checked}
              onChange={() => onCheckChange?.()}
              aria-label="Select row"
              onClick={(e) => e.stopPropagation()}
            />
          </label>
        </TableCell>
      )}
      {children}
      {showMenuColumn && (
        <TableCell
          className="w-10 px-1 py-3 text-end align-middle bg-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex justify-end">
            <button
              type="button"
              className="dropdown-toggle rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-white/10"
              aria-expanded={menuOpen}
              aria-label="Row actions"
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
            <Dropdown isOpen={menuOpen} onClose={() => setMenuOpen(false)} className="min-w-[160px] py-1">
              {(menuItems ?? [{ label: "Open", onClick: () => undefined }]).map((item, i) => (
                <DropdownItem
                  key={`${item.label}-${i}`}
                  onItemClick={() => {
                    item.onClick();
                    setMenuOpen(false);
                  }}
                >
                  {item.label}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}

export interface DashboardTableSelectHeaderProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: () => void;
}

export function DashboardTableSelectHeader({ checked = false, indeterminate, onChange }: DashboardTableSelectHeaderProps) {
  const { showSelectColumn } = useDashboardTable();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = !!indeterminate;
  }, [indeterminate]);

  if (!showSelectColumn) return null;
  return (
    <th scope="col" className="w-10 bg-transparent px-2 py-3 text-center">
      <label className="inline-flex cursor-pointer items-center justify-center">
        <input
          ref={inputRef}
          type="checkbox"
          className="size-3.5 rounded border-gray-300 text-brand-600 focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900"
          checked={checked}
          onChange={() => onChange?.()}
          aria-label="Select all"
        />
      </label>
    </th>
  );
}

export function DashboardTableMenuHeader() {
  const { showMenuColumn } = useDashboardTable();
  if (!showMenuColumn) return null;
  return <th scope="col" className="w-10 bg-transparent px-1" aria-hidden />;
}

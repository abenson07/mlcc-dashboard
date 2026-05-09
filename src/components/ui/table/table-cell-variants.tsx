"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { useDashboardTable } from "./dashboard-table-context";

export type DashboardCellAlign = "start" | "end";

const alignTdClass: Record<DashboardCellAlign, string> = {
  start: "text-start",
  end: "text-end",
};

const alignInnerClass: Record<DashboardCellAlign, string> = {
  start: "justify-start text-start",
  end: "justify-end text-end ml-auto",
};

function alignStackClass(align: DashboardCellAlign): string {
  return align === "end" ? "items-end text-end" : "items-start text-start";
}

export interface DashboardTableDataCellProps {
  children: ReactNode;
  align?: DashboardCellAlign;
  /** When true and table is condensed (detail open), cell is hidden. */
  collapsible?: boolean;
  className?: string;
  isHeader?: boolean;
}

/**
 * Table cell with optional Mercury-style collapsible behavior (hides when detail panel open).
 */
export function DashboardTableDataCell({
  children,
  align = "start",
  collapsible = false,
  className = "",
  isHeader = false,
}: DashboardTableDataCellProps) {
  const { isCondensed } = useDashboardTable();
  const hidden = collapsible && isCondensed;
  const Tag = isHeader ? "th" : "td";
  return (
    <Tag
      className={`bg-transparent px-4 py-3 sm:px-5 sm:py-4 ${alignTdClass[align]} ${hidden ? "hidden" : ""} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}

// --- Variant content (use inside DashboardTableDataCell or raw td) ---

export interface StackedCellProps {
  primary: ReactNode;
  secondary?: ReactNode;
  align?: DashboardCellAlign;
  className?: string;
}

export function StackedCellContent({ primary, secondary, align = "start", className = "" }: StackedCellProps) {
  return (
    <div className={`flex flex-col gap-0.5 min-w-0 ${alignStackClass(align)} ${className}`.trim()}>
      <div className="text-theme-sm font-medium text-gray-800 dark:text-white/90 truncate">{primary}</div>
      {secondary != null && secondary !== "" && (
        <div className="text-theme-xs text-gray-500 dark:text-gray-400 truncate">{secondary}</div>
      )}
    </div>
  );
}

export interface StatusCellContentProps {
  label: string;
  color?: "primary" | "success" | "error" | "warning" | "info" | "light";
  align?: DashboardCellAlign;
}

export function StatusCellContent({ label, color = "warning", align = "start" }: StatusCellContentProps) {
  return (
    <div className={`flex min-w-0 ${alignInnerClass[align]}`}>
      <Badge variant="light" color={color} size="sm">
        {label}
      </Badge>
    </div>
  );
}

export interface NormalCellContentProps {
  children: ReactNode;
  align?: DashboardCellAlign;
  className?: string;
}

export function NormalCellContent({ children, align = "start", className = "" }: NormalCellContentProps) {
  return (
    <div
      className={`text-theme-sm text-gray-800 dark:text-white/90 flex min-w-0 ${alignInnerClass[align]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

/** Currency: dollars + superscript cents (Mercury-style). */
export interface CurrencyCellContentProps {
  dollars: string;
  cents: string;
  align?: DashboardCellAlign;
}

export function CurrencyCellContent({ dollars, cents, align = "end" }: CurrencyCellContentProps) {
  return (
    <div className={`flex min-w-0 tabular-nums ${alignInnerClass[align]}`}>
      <span className="text-theme-sm font-medium text-gray-900 dark:text-white/90">
        {dollars}
        <sup className="text-[10px] font-semibold align-super leading-none">{cents}</sup>
      </span>
    </div>
  );
}

export interface ActionCellContentProps {
  align?: DashboardCellAlign;
  children: ReactNode;
  className?: string;
}

export function ActionCellContent({ align = "start", children, className = "" }: ActionCellContentProps) {
  return (
    <div className={`flex min-w-0 ${alignInnerClass[align]} ${className}`.trim()}>{children}</div>
  );
}

export interface ActionLinkProps {
  href: string;
  children: ReactNode;
  align?: DashboardCellAlign;
  className?: string;
  external?: boolean;
}

export function ActionLink({ href, children, align = "start", className = "", external }: ActionLinkProps) {
  return (
    <div className={`flex min-w-0 ${alignInnerClass[align]}`}>
      <Link
        href={href}
        className={`text-theme-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 underline-offset-2 hover:underline ${className}`.trim()}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </Link>
    </div>
  );
}

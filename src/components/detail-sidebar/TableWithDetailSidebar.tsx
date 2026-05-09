"use client";

import React, { useEffect, ReactNode } from "react";
import { DashboardTableProvider } from "@/components/ui/table/dashboard-table-context";

export interface DashboardTableOptions {
  showSelectColumn: boolean;
  showMenuColumn: boolean;
}

export interface TableWithDetailSidebarProps<T> {
  selectedItem: T | null;
  onClose: () => void;
  sidebarTitle?: string;
  children: ReactNode;
  renderSidebar: (item: T) => ReactNode;
  /** When set, wraps `children` in dashboard table context for condensed columns / row chrome. */
  dashboardTable?: DashboardTableOptions;
  /** Tailwind width classes for the detail aside (default Mercury-ish fixed width). */
  asideWidthClass?: string;
}

export default function TableWithDetailSidebar<T>({
  selectedItem,
  onClose,
  sidebarTitle = "Details",
  children,
  renderSidebar,
  dashboardTable,
  asideWidthClass = "w-[380px]",
}: TableWithDetailSidebarProps<T>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const inner =
    dashboardTable != null ? (
      <DashboardTableProvider
        detailOpen={selectedItem != null}
        showSelectColumn={dashboardTable.showSelectColumn}
        showMenuColumn={dashboardTable.showMenuColumn}
      >
        {children}
      </DashboardTableProvider>
    ) : (
      children
    );

  if (selectedItem == null) {
    return <>{inner}</>;
  }

  return (
    <div className="relative flex w-full min-h-0 items-stretch gap-4 transition-[gap] duration-200">
      <div className="min-w-0 flex-1 shrink transition-[flex-basis] duration-200">{inner}</div>
      <aside
        className={`flex max-h-[calc(100vh-7rem)] min-h-0 shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] ${asideWidthClass}`}
        aria-label={sidebarTitle}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-white/[0.05]">
          <h3 className="min-w-0 flex-1 font-medium text-gray-800 text-theme-sm dark:text-white/90">{sidebarTitle}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 dark:hover:bg-white/10 dark:hover:text-white/90"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">{renderSidebar(selectedItem)}</div>
      </aside>
    </div>
  );
}

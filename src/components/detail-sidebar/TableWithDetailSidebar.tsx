"use client";

import React, { useEffect } from "react";
import { CloseIcon } from "@/icons";
import Button from "@/components/ui/button/Button";

export interface TableWithDetailSidebarProps<T> {
  selectedItem: T | null;
  onClose: () => void;
  sidebarTitle?: string;
  children: React.ReactNode;
  renderSidebar: (item: T) => React.ReactNode;
}

export function TableWithDetailSidebar<T>({
  selectedItem,
  onClose,
  sidebarTitle = "Details",
  children,
  renderSidebar,
}: TableWithDetailSidebarProps<T>) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (selectedItem != null) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedItem, onClose]);

  if (selectedItem == null) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex w-full gap-4">
      <div className="min-w-0 flex-1">{children}</div>
      <aside
        className="sticky top-[105px] flex w-[380px] shrink-0 flex-col self-start overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
        aria-label={sidebarTitle}
      >
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-white/[0.05]">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">{sidebarTitle}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.08] dark:hover:text-white/90"
            aria-label="Close sidebar"
          >
            <CloseIcon className="size-5 shrink-0 fill-current" />
          </Button>
        </div>
        <div className="p-4">{renderSidebar(selectedItem)}</div>
      </aside>
    </div>
  );
}

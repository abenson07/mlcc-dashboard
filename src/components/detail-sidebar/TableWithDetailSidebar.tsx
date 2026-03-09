"use client";

import React, { useEffect, ReactNode } from "react";
import Button from "@/components/ui/button/Button";
import { CloseIcon } from "@/icons";

export interface TableWithDetailSidebarProps<T> {
  selectedItem: T | null;
  onClose: () => void;
  sidebarTitle?: string;
  children: ReactNode;
  renderSidebar: (item: T) => ReactNode;
}

export default function TableWithDetailSidebar<T>({
  selectedItem,
  onClose,
  sidebarTitle = "Details",
  children,
  renderSidebar,
}: TableWithDetailSidebarProps<T>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (selectedItem == null) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex w-full gap-4">
      <div className="min-w-0 flex-1">{children}</div>
      <aside
        className="w-[380px] shrink-0 self-start overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] sticky top-[105px]"
        aria-label={sidebarTitle}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/[0.05]">
          <h3 className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {sidebarTitle}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="!p-2"
            startIcon={<CloseIcon className="size-5 shrink-0 fill-current" />}
          >
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-4">
          {renderSidebar(selectedItem)}
        </div>
      </aside>
    </div>
  );
}

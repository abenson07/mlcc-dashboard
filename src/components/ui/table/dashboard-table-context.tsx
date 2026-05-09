"use client";

import React, { createContext, useContext, useMemo } from "react";

export interface DashboardTableContextValue {
  detailOpen: boolean;
  showSelectColumn: boolean;
  showMenuColumn: boolean;
  /** True when detail panel is open; hide `collapsible` columns. */
  isCondensed: boolean;
}

const DashboardTableContext = createContext<DashboardTableContextValue | null>(null);

const defaultValue: DashboardTableContextValue = {
  detailOpen: false,
  showSelectColumn: false,
  showMenuColumn: false,
  isCondensed: false,
};

export function DashboardTableProvider({
  children,
  detailOpen,
  showSelectColumn,
  showMenuColumn,
}: {
  children: React.ReactNode;
  detailOpen: boolean;
  showSelectColumn: boolean;
  showMenuColumn: boolean;
}) {
  const value = useMemo<DashboardTableContextValue>(
    () => ({
      detailOpen,
      showSelectColumn,
      showMenuColumn,
      isCondensed: detailOpen,
    }),
    [detailOpen, showSelectColumn, showMenuColumn],
  );
  return <DashboardTableContext.Provider value={value}>{children}</DashboardTableContext.Provider>;
}

/** Returns default context when used outside a provider (collapsible columns stay visible). */
export function useDashboardTable(): DashboardTableContextValue {
  return useContext(DashboardTableContext) ?? defaultValue;
}

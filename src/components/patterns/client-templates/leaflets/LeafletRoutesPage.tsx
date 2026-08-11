"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { sampleOpenRoutes, sampleSkippedRoutes, type LeafletRouteRow } from "@/data/mocks/leaflets";

const GROUP_ORDER = ["unassigned", "in-progress", "skipped"];

const GROUP_LABEL: Record<string, string> = {
  unassigned: "Unassigned",
  "in-progress": "In progress",
  skipped: "Skipped",
};

const groupColors: Record<string, string> = {
  unassigned: "#eb5757",
  "in-progress": "#f2c94c",
  skipped: "#8a8f98",
};

export type LeafletRoutesPageProps = {
  onSelectRoute?: (row: LeafletRouteRow) => void;
};

function buildColumns(onSelectRoute?: (row: LeafletRouteRow) => void): TableColumn<LeafletRouteRow>[] {
  return [
    {
      key: "name",
      header: "Route",
      width: proportional(1, { minWidth: 220 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectRoute?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.name}</span>
        </RowClickCell>
      ),
    },
    {
      key: "detail",
      header: "Detail",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectRoute?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.detail}</span>
        </RowClickCell>
      ),
    },
  ];
}

/**
 * Full-width Routes list — all open + skipped routes for this leaflet,
 * grouped by status. Mirrors `VolunteersPage`.
 */
export function LeafletRoutesPage({ onSelectRoute }: LeafletRoutesPageProps) {
  const columns = useMemo(() => buildColumns(onSelectRoute), [onSelectRoute]);
  const groupOrder = useMemo(() => GROUP_ORDER, []);
  const routes = useMemo(() => [...sampleOpenRoutes, ...sampleSkippedRoutes], []);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable
        data={routes}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.status}
        groupOrder={groupOrder}
        getGroupMeta={(key) => ({ color: groupColors[key], label: GROUP_LABEL[key] ?? key })}
        listChrome
      />
    </div>
  );
}

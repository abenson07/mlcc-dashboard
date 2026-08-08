"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { sampleDeliverers, type LeafletDelivererRow } from "@/data/mocks/leaflets";

const GROUP_ORDER = ["Confirmed", "Invited", "Declined"];

const groupColors: Record<string, string> = {
  Confirmed: "#27a644",
  Invited: "#f2c94c",
  Declined: "#8a8f98",
};

function buildColumns(): TableColumn<LeafletDelivererRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell>
          <Avatar name={row.name} size="sm" />
          <span
            style={{
              marginInlineStart: 8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "var(--linear-color-ink)",
            }}
          >
            {row.name}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "routeCount",
      header: "Routes",
      width: pixel(100),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.routeCount}</span>
        </RowClickCell>
      ),
    },
  ];
}

/**
 * Full-width Deliverers list — same list chrome as Foundation's own
 * grouped-table canvas, grouped by RSVP status. Mirrors `VolunteersPage`.
 */
export function LeafletDeliverersPage() {
  const columns = useMemo(() => buildColumns(), []);
  const groupOrder = useMemo(() => GROUP_ORDER, []);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable
        data={sampleDeliverers}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.status}
        groupOrder={groupOrder}
        getGroupMeta={(key) => ({ color: groupColors[key], label: key })}
        listChrome
      />
    </div>
  );
}

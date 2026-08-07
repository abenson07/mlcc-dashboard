"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { BudgetStatusToken } from "./BudgetStatusToken";
import { BudgetChart } from "./BudgetChart";
import { SponsorshipLevelsPanel } from "./SponsorshipLevelsPanel";
import {
  sampleEventBudgetItems,
  sampleEventBudgetSummary,
  type EventBudgetRow,
} from "@/data/mocks/events";

const GROUP_ORDER = ["Overdue", "Pending", "Paid"];

const groupColors: Record<string, string> = {
  Overdue: "#eb5757",
  Pending: "#f2c94c",
  Paid: "#27a644",
};

function buildColumns(
  onSelectBudgetItem?: (row: EventBudgetRow) => void,
): TableColumn<EventBudgetRow>[] {
  return [
    {
      key: "item",
      header: "Item",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectBudgetItem?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.item}</span>
        </RowClickCell>
      ),
    },
    {
      key: "vendor",
      header: "Vendor",
      width: pixel(200),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectBudgetItem?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.vendor}</span>
        </RowClickCell>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: pixel(96),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectBudgetItem?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.amount}</span>
        </RowClickCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: pixel(140),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectBudgetItem?.(row)}>
          <BudgetStatusToken item={row} />
        </RowClickCell>
      ),
    },
  ];
}

export type BudgetPageProps = {
  onSelectBudgetItem?: (row: EventBudgetRow) => void;
};

/**
 * Sponsorships page — a five-column summary row (budget chart spanning
 * four columns, sponsorship levels in the fifth) above the full-width
 * budget item list, grouped by payment status.
 */
export function BudgetPage({ onSelectBudgetItem }: BudgetPageProps) {
  const columns = useMemo(
    () => buildColumns(onSelectBudgetItem),
    [onSelectBudgetItem],
  );
  const groupOrder = useMemo(() => GROUP_ORDER, []);

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        boxSizing: "border-box",
        padding: "0 8px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          alignItems: "stretch",
          flexShrink: 0,
        }}
      >
        <div style={{ gridColumn: "span 4" }}>
          <BudgetChart summary={sampleEventBudgetSummary} />
        </div>
        <div style={{ gridColumn: "span 1" }}>
          <SponsorshipLevelsPanel />
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <GroupedTable
          data={sampleEventBudgetItems}
          columns={columns}
          getRowKey={(row) => row.id}
          groupBy={(row) => row.status}
          groupOrder={groupOrder}
          getGroupMeta={(key) => ({ color: groupColors[key], label: key })}
          listChrome
        />
      </div>
    </div>
  );
}

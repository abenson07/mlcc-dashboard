"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import { RowClickCell, ClassContentPage } from "@/components/patterns/client-templates/shared";
import { BudgetChart } from "./BudgetChart";
import { SponsorshipLevelsPanel } from "./SponsorshipLevelsPanel";
import {
  sampleEventBudgetSummary,
  sampleEventSponsorshipInvoices,
  type EventSponsorshipInvoiceRow,
} from "@/data/mocks/events";

const GROUP_ORDER = ["Overdue", "Pending", "Paid"];

const groupColors: Record<string, string> = {
  Overdue: "#eb5757",
  Pending: "#f2c94c",
  Paid: "#27a644",
};

function buildColumns(
  onSelectInvoice?: (row: EventSponsorshipInvoiceRow) => void,
): TableColumn<EventSponsorshipInvoiceRow>[] {
  return [
    {
      key: "business",
      header: "Business",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.business}</span>
        </RowClickCell>
      ),
    },
    {
      key: "invoiceNumber",
      header: "Invoice #",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.invoiceNumber}</span>
        </RowClickCell>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: pixel(96),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.amount}</span>
        </RowClickCell>
      ),
    },
    {
      key: "dueDate",
      header: "Due",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.dueDate}</span>
        </RowClickCell>
      ),
    },
    {
      key: "level",
      header: "Level",
      width: pixel(140),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.level}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type BudgetPageProps = {
  onSelectBudgetItem?: (row: EventSponsorshipInvoiceRow) => void;
};

/**
 * Sponsorships page — mixed-content layout like Overview: a five-column
 * summary row (budget chart spanning four columns, sponsorship levels in
 * the fifth), then sponsorship invoices nested below, grouped by payment
 * status.
 */
export function BudgetPage({ onSelectBudgetItem }: BudgetPageProps) {
  const columns = useMemo(
    () => buildColumns(onSelectBudgetItem),
    [onSelectBudgetItem],
  );
  const groupOrder = useMemo(() => GROUP_ORDER, []);

  return (
    <ClassContentPage>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        <div style={{ gridColumn: "span 4" }}>
          <BudgetChart summary={sampleEventBudgetSummary} />
        </div>
        <div style={{ gridColumn: "span 1" }}>
          <SponsorshipLevelsPanel />
        </div>
      </div>
      <NestedGroupedTable
        title="Sponsorship invoices"
        data={sampleEventSponsorshipInvoices}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.status}
        groupOrder={groupOrder}
        getGroupMeta={(key) => ({ color: groupColors[key], label: key })}
      />
    </ClassContentPage>
  );
}

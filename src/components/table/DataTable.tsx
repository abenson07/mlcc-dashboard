"use client";
import React, { useMemo, useState } from "react";
import { Invoice, InvoiceStatus } from "./types";
import DetailPanel from "./DetailPanel";
import TableWithDetailSidebar from "@/components/detail-sidebar/TableWithDetailSidebar";
import {
  Table,
  TableHeader,
  TableBody,
  DashboardTableDataCell,
  StackedCellContent,
  StatusCellContent,
  NormalCellContent,
  CurrencyCellContent,
  DashboardTableRow,
  DashboardTableSelectHeader,
  DashboardTableMenuHeader,
} from "@/components/ui/table";

interface Props {
  invoices: Invoice[];
}

const headerCell =
  "border-b border-gray-200 px-3 py-2.5 text-left text-xs font-medium text-gray-500 dark:border-white/[0.05] dark:text-gray-400";

function statusColor(status: InvoiceStatus): "warning" | "info" | "success" {
  if (status === "Overdue") return "warning";
  if (status === "Paid") return "success";
  return "info";
}

export default function DataTable({ invoices }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [allChecked, setAllChecked] = useState(false);

  const selected = invoices.find((i) => i.id === selectedId) ?? null;

  const toggleRow = (id: number) => setSelectedId((prev) => (prev === id ? null : id));
  const toggleCheck = (id: number) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const checkedCount = useMemo(() => {
    const fromMap = invoices.filter((i) => checked[i.id]).length;
    if (allChecked) return invoices.length;
    return fromMap;
  }, [allChecked, checked, invoices]);

  const allSelected = checkedCount === invoices.length && invoices.length > 0;
  const indeterminate = !allSelected && checkedCount > 0;

  const handleSelectAll = () => {
    if (allSelected || allChecked) {
      setAllChecked(false);
      setChecked({});
    } else {
      setAllChecked(true);
      setChecked({});
    }
  };

  return (
    <TableWithDetailSidebar
      selectedItem={selected}
      onClose={() => setSelectedId(null)}
      sidebarTitle={selected ? `Invoice to ${selected.customer}` : "Details"}
      asideWidthClass="w-full max-w-[420px]"
      dashboardTable={{ showSelectColumn: true, showMenuColumn: true }}
      renderSidebar={(inv) => (
        <DetailPanel invoice={inv} onClose={() => setSelectedId(null)} showOuterHeader={false} />
      )}
    >
      <div className="bg-white dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table className="w-full border-collapse">
            <TableHeader>
              <tr className="border-b border-gray-200 dark:border-white/[0.05]">
                <DashboardTableSelectHeader
                  checked={allSelected || allChecked}
                  indeterminate={indeterminate}
                  onChange={handleSelectAll}
                />
                <DashboardTableDataCell isHeader align="start" className={headerCell}>
                  Due date
                </DashboardTableDataCell>
                <DashboardTableDataCell isHeader align="start" className={headerCell}>
                  <span className="inline-flex items-center gap-1">
                    Status
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                      <path
                        d="M5.5 2v7M2.5 6l3 3 3-3"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </DashboardTableDataCell>
                <DashboardTableDataCell isHeader align="start" className={headerCell}>
                  Customer
                </DashboardTableDataCell>
                <DashboardTableDataCell isHeader align="end" className={`${headerCell} text-right`}>
                  Amount
                </DashboardTableDataCell>
                <DashboardTableDataCell
                  isHeader
                  align="start"
                  collapsible
                  className={headerCell}
                >
                  Invoice no.
                </DashboardTableDataCell>
                <DashboardTableDataCell
                  isHeader
                  align="start"
                  collapsible
                  className={headerCell}
                >
                  Invoice date
                </DashboardTableDataCell>
                <DashboardTableDataCell isHeader align="start" className={headerCell}>
                  Type
                </DashboardTableDataCell>
                <DashboardTableMenuHeader />
              </tr>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {invoices.map((inv) => {
                const isSelected = selectedId === inv.id;
                const rowChecked = !!checked[inv.id] || allChecked;
                return (
                  <DashboardTableRow
                    key={inv.id}
                    onClick={() => toggleRow(inv.id)}
                    selected={isSelected}
                    checked={rowChecked}
                    onCheckChange={() => toggleCheck(inv.id)}
                    menuItems={[
                      { label: "Mark as paid", onClick: () => undefined },
                      { label: "View details", onClick: () => setSelectedId(inv.id) },
                    ]}
                  >
                    <DashboardTableDataCell align="start" className="py-3.5">
                      <StackedCellContent primary={inv.dueDate} secondary={inv.dueRel} />
                    </DashboardTableDataCell>
                    <DashboardTableDataCell align="start" className="py-3.5">
                      <StatusCellContent label={inv.status} color={statusColor(inv.status)} />
                    </DashboardTableDataCell>
                    <DashboardTableDataCell align="start" className="max-w-[200px] py-3.5">
                      <StackedCellContent primary={inv.customer} secondary={inv.email} />
                    </DashboardTableDataCell>
                    <DashboardTableDataCell align="end" className="py-3.5">
                      <CurrencyCellContent dollars={inv.amount} cents={inv.cents} align="end" />
                    </DashboardTableDataCell>
                    <DashboardTableDataCell align="start" collapsible className="py-3.5">
                      <NormalCellContent>{inv.invoiceNo}</NormalCellContent>
                    </DashboardTableDataCell>
                    <DashboardTableDataCell align="start" collapsible className="py-3.5">
                      <NormalCellContent>{inv.invoiceDate}</NormalCellContent>
                    </DashboardTableDataCell>
                    <DashboardTableDataCell align="start" className="py-3.5">
                      <NormalCellContent>{inv.type}</NormalCellContent>
                    </DashboardTableDataCell>
                  </DashboardTableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </TableWithDetailSidebar>
  );
}

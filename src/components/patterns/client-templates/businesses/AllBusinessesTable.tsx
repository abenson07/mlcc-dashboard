"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { sampleAllBusinesses, type BusinessRow } from "@/data/mocks/businesses";

function buildColumns(): TableColumn<BusinessRow>[] {
  return [
    {
      key: "businessName",
      header: "Business",
      width: proportional(1, { minWidth: 200 }),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.businessName}</span>
        </RowClickCell>
      ),
    },
    {
      key: "category",
      header: "Category",
      width: pixel(160),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.category}</span>
        </RowClickCell>
      ),
    },
    {
      key: "contactName",
      header: "Contact",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.contactName}</span>
        </RowClickCell>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      width: pixel(140),
      renderCell: (row) => (
        <RowClickCell>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.phone}</span>
        </RowClickCell>
      ),
    },
  ];
}

/** Full directory of all businesses — flat, ungrouped. */
export function AllBusinessesTable() {
  const columns = useMemo(() => buildColumns(), []);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable
        data={sampleAllBusinesses}
        columns={columns}
        getRowKey={(row) => row.id}
        listChrome
      />
    </div>
  );
}

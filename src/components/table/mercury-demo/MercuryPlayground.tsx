"use client";

import React, { useMemo, useState } from "react";
import Select from "@/components/form/Select";
import TableWithDetailSidebar from "@/components/detail-sidebar/TableWithDetailSidebar";
import DataTable from "@/components/table/DataTable";
import { invoices } from "@/components/table/data";
import type { MercuryVariantId } from "./types";
import { useMercuryPlaygroundData } from "./useMercuryPlaygroundData";
import {
  MercuryVariantTable,
  resolveMercurySelectedItem,
  mercuryReadOnlySidebarTitle,
  renderMercuryReadOnlySidebar,
} from "./mercuryVariantTable";

const VARIANT_OPTIONS: { value: MercuryVariantId; label: string }[] = [
  { value: "neighbors-all", label: "Neighbors — All (/neighbors)" },
  { value: "neighbors-members", label: "Neighbors — Members (?view=members)" },
  { value: "neighbors-duplicate-memberships", label: "Neighbors — Duplicate memberships (/neighbors/duplicate-memberships)" },
  { value: "routes-all", label: "Routes — All (/routes/all)" },
  { value: "routes-claimed", label: "Routes — Claimed (/routes/claimed)" },
  { value: "routes-open", label: "Routes — Open (/routes/open)" },
  { value: "businesses-all", label: "Businesses — All (/businesses)" },
  { value: "businesses-members", label: "Businesses — Members (/businesses?view=members)" },
  { value: "billing-invoices", label: "Sponsorship — Invoices (/sponsorship?view=invoices)" },
  { value: "original-invoice-demo", label: "Original invoice demo (Mercury prototype)" },
];

export default function MercuryPlayground() {
  const [variant, setVariant] = useState<MercuryVariantId>("neighbors-all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const mercury = useMercuryPlaygroundData(variant);

  const handleVariantChange = (v: string) => {
    setVariant(v as MercuryVariantId);
    setSelectedId(null);
  };

  const selectedUnion = useMemo(
    () => resolveMercurySelectedItem(variant, mercury, selectedId),
    [variant, mercury, selectedId],
  );

  const sidebarTitle = useMemo(
    () => mercuryReadOnlySidebarTitle(variant, selectedUnion),
    [variant, selectedUnion],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label className="mb-1 block text-theme-xs font-medium text-gray-500 dark:text-gray-400">
            Table preview
          </label>
          <Select
            options={VARIANT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            placeholder="Choose a table…"
            defaultValue="neighbors-all"
            className="max-w-xl min-w-[280px]"
            onChange={handleVariantChange}
          />
        </div>
        <p className="text-theme-xs text-gray-500 dark:text-gray-400">
          {variant === "original-invoice-demo"
            ? "Classic Mercury invoice list · Same sample data as the earlier standalone demo"
            : variant === "billing-invoices"
              ? "Original Mercury invoice columns · Live Stripe data (same as Sponsorship → Invoices tab)"
              : "Live data from Supabase and Stripe (matches each route’s sources)"}
        </p>
      </div>

      {variant === "original-invoice-demo" ? (
        <div className="-mx-2 min-w-0 overflow-x-auto sm:mx-0">
          <DataTable invoices={invoices} />
        </div>
      ) : (
        <TableWithDetailSidebar
          selectedItem={selectedUnion}
          onClose={() => setSelectedId(null)}
          sidebarTitle={sidebarTitle}
          asideWidthClass="w-full max-w-[420px]"
          dashboardTable={{ showSelectColumn: true, showMenuColumn: true }}
          renderSidebar={(row) =>
            row ? renderMercuryReadOnlySidebar(variant, row) : null
          }
        >
          <MercuryVariantTable
            key={variant}
            variant={variant}
            mercury={mercury}
            selectedKey={selectedId}
            onSelectKey={setSelectedId}
          />
        </TableWithDetailSidebar>
      )}
    </div>
  );
}

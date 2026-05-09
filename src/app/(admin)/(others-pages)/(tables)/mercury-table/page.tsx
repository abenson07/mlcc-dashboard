import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DataTable from "@/components/table/DataTable";
import { invoices } from "@/components/table/data";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Mercury-style table",
  description:
    "Demo: split detail panel, collapsible columns, optional select and row menu.",
};

export default function MercuryTablePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Mercury-style table" />
      <div className="space-y-6">
        <ComponentCard
          title="Invoice list"
          desc="Click a row to open the right-hand panel; collapsible columns hide while the panel is open. Escape closes the panel."
        >
          <div className="-mx-2 min-w-0 overflow-x-auto sm:mx-0">
            <DataTable invoices={invoices} />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}

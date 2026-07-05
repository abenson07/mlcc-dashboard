import React from "react";
import { Metadata } from "next";
import TopBar from "@/components/table/TopBar";
import MetricsCards from "@/components/table/MetricsCards";
import FiltersBar from "@/components/table/FiltersBar";
import DataTable from "@/components/table/DataTable";
import { invoices } from "@/components/table/data";

export const metadata: Metadata = {
  title: "Table",
};

export default function TablePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <TopBar />
        <MetricsCards />
        <FiltersBar />
        <DataTable invoices={invoices} />
      </div>
    </div>
  );
}

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OpenRoutesTable from "@/components/tables/OpenRoutesTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Open Routes",
  description: "View open routes",
};

export default function OpenRoutesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Open Routes" />
      <div className="space-y-6">
        <ComponentCard title="Open Routes">
          <OpenRoutesTable />
        </ComponentCard>
      </div>
    </div>
  );
}

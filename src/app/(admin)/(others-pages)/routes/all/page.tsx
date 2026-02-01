import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AllRoutesTable from "@/components/tables/AllRoutesTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "All Routes",
  description: "View all routes",
};

export default function AllRoutesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="All Routes" />
      <div className="space-y-6">
        <ComponentCard title="All Routes">
          <AllRoutesTable />
        </ComponentCard>
      </div>
    </div>
  );
}

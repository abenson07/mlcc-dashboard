import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AllNeighborsTable from "@/components/tables/AllNeighborsTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "All Neighbors",
  description: "View all neighbors",
};

export default function AllNeighborsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="All Neighbors" />
      <div className="space-y-6">
        <ComponentCard title="All Neighbors">
          <AllNeighborsTable />
        </ComponentCard>
      </div>
    </div>
  );
}

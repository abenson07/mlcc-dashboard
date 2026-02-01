import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import NeighborsMembersTable from "@/components/tables/NeighborsMembersTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Neighbors - Members",
  description: "View neighbor members",
};

export default function NeighborsMembersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Neighbors - Members" />
      <div className="space-y-6">
        <ComponentCard title="Neighbors - Members">
          <NeighborsMembersTable />
        </ComponentCard>
      </div>
    </div>
  );
}

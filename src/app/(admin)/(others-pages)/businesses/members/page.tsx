import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BusinessMembersTable from "@/components/tables/BusinessMembersTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Businesses - Members",
  description: "View business members with active membership",
};

export default function BusinessesMembersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Businesses - Members" />
      <div className="space-y-6">
        <ComponentCard title="Businesses - Members">
          <BusinessMembersTable />
        </ComponentCard>
      </div>
    </div>
  );
}

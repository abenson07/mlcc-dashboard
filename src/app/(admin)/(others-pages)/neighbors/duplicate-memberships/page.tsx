import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Neighbors - Duplicate Memberships",
  description: "View duplicate memberships",
};

export default function DuplicateMembershipsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Neighbors - Duplicate Memberships" />
      <div className="space-y-6">
        <ComponentCard title="Duplicate Memberships">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "All Businesses",
  description: "View all businesses",
};

export default function AllBusinessesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="All Businesses" />
      <div className="space-y-6">
        <ComponentCard title="All Businesses">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}

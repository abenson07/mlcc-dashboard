import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
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
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            Coming Soon
          </p>
        </ComponentCard>
      </div>
    </div>
  );
}

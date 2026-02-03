import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AllBusinessesContent from "@/components/businesses/AllBusinessesContent";
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
        <AllBusinessesContent />
      </div>
    </div>
  );
}

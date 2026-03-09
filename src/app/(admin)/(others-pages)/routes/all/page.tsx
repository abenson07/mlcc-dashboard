import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AllRoutesContent from "@/components/routes/AllRoutesContent";
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
        <AllRoutesContent />
      </div>
    </div>
  );
}

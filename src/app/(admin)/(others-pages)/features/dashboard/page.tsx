import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FeaturesContent from "@/components/features/FeaturesContent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard features",
  description: "Vote on dashboard features",
};

export default function DashboardFeaturesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard features" />
      <div className="space-y-6">
        <FeaturesContent surface="dashboard" />
      </div>
    </div>
  );
}

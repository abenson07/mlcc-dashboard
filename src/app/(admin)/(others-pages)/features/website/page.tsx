import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FeaturesContent from "@/components/features/FeaturesContent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Website features",
  description: "Vote on website features",
};

export default function WebsiteFeaturesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Website features" />
      <div className="space-y-6">
        <FeaturesContent surface="website" />
      </div>
    </div>
  );
}

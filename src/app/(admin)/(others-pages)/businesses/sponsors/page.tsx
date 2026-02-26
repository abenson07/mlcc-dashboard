import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Businesses - Sponsors",
  description: "View business sponsors",
};

export default function SponsorsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Businesses - Sponsors" />
      <div className="space-y-6">
        <ComponentCard title="Businesses - Sponsors">
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            Coming Soon
          </p>
        </ComponentCard>
      </div>
    </div>
  );
}

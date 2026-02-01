import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
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
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}

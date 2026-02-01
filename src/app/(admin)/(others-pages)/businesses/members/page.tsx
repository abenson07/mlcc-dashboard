import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Businesses - Members",
  description: "View business members",
};

export default function BusinessesMembersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Businesses - Members" />
      <div className="space-y-6">
        <ComponentCard title="Businesses - Members">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}

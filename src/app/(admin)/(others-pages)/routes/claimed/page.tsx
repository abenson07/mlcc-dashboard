import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ClaimedRoutesContent from "@/components/routes/ClaimedRoutesContent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Claimed Routes",
  description: "View claimed routes",
};

export default function ClaimedRoutesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Claimed Routes" />
      <div className="space-y-6">
        <ClaimedRoutesContent />
      </div>
    </div>
  );
}

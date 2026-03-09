import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OpenRoutesContent from "@/components/routes/OpenRoutesContent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Open Routes",
  description: "View open routes",
};

export default function OpenRoutesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Open Routes" />
      <div className="space-y-6">
        <OpenRoutesContent />
      </div>
    </div>
  );
}

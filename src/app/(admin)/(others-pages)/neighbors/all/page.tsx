import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AllNeighborsContent from "@/components/neighbors/AllNeighborsContent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "All Neighbors",
  description: "View all neighbors",
};

export default function AllNeighborsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="All Neighbors" />
      <div className="space-y-6">
        <AllNeighborsContent />
      </div>
    </div>
  );
}

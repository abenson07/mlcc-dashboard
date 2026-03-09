import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import NeighborsMembersContent from "@/components/neighbors/NeighborsMembersContent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Neighbors - Members",
  description: "View neighbor members",
};

export default function NeighborsMembersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Neighbors - Members" />
      <div className="space-y-6">
        <NeighborsMembersContent />
      </div>
    </div>
  );
}

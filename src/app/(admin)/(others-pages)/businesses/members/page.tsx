import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BusinessesMembersContent from "@/components/businesses/BusinessesMembersContent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Businesses - Members",
  description: "View business members with active membership",
};

export default function BusinessesMembersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Businesses - Members" />
      <div className="space-y-6">
        <BusinessesMembersContent />
      </div>
    </div>
  );
}

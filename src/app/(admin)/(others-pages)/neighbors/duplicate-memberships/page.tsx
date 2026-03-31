import DuplicateMembersContent from "@/components/neighbors/DuplicateMembersContent";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Duplicate Members",
  description:
    "Duplicate membership monitor by product, email, and normalized mailing address from active Stripe subscriptions",
};

export default function DuplicateMembershipsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Duplicate Members" />
      <div className="space-y-6">
        <DuplicateMembersContent />
      </div>
    </div>
  );
}

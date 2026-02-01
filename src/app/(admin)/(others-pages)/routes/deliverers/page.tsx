import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DeliverersContent from "@/components/routes/DeliverersContent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Deliverers",
  description: "View deliverers and their routes",
};

export default function DeliverersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Deliverers" />
      <div className="space-y-6">
        <DeliverersContent />
      </div>
    </div>
  );
}

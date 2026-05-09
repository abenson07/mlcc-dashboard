import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MercuryPlayground from "@/components/table/mercury-demo/MercuryPlayground";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Mercury-style table",
  description:
    "Demo: split detail panel, collapsible columns, optional select and row menu.",
};

export default function MercuryTablePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Mercury-style table" />
      <div className="space-y-6">
        <ComponentCard
          title="Mercury-style tables"
          desc="Pick a table: neighbors and routes load from Supabase via the same hooks as their pages; duplicate memberships and invoices load from the existing Stripe API routes; businesses load from Supabase (members = active business_memberships only). The original Mercury invoice demo still uses static rows. Row click opens the panel where applicable; Escape closes it."
        >
          <MercuryPlayground />
        </ComponentCard>
      </div>
    </div>
  );
}

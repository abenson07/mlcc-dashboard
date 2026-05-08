import InvoicesListTable from "@/components/billing/InvoicesListTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Invoices",
  description: "Stripe invoices and reminders",
};

export default function BillingInvoicesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Invoices" />
      <div className="mt-2 space-y-4">
        <InvoicesListTable />
      </div>
    </div>
  );
}

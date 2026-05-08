import StripeInvoiceComposer from "@/components/billing/StripeInvoiceComposer";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "New invoice",
  description: "Create and send a Stripe invoice",
};

export default function BillingInvoicesNewPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="New invoice" />
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        <Link
          href="/billing/invoices"
          className="font-medium text-brand-600 underline dark:text-brand-400"
        >
          Back to invoices
        </Link>
      </p>
      <div className="mt-4 space-y-6">
        <StripeInvoiceComposer />
      </div>
    </div>
  );
}

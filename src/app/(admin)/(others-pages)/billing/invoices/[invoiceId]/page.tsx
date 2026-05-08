import InvoiceDetailBody from "@/components/billing/InvoiceDetailBody";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import type { Metadata } from "next";
import React from "react";

type Props = { params: Promise<{ invoiceId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { invoiceId } = await params;
  return {
    title: `Invoice ${invoiceId}`,
    description: "Stripe invoice details",
  };
}

export default async function BillingInvoiceDetailPage({ params }: Props) {
  const { invoiceId } = await params;
  return (
    <div>
      <PageBreadcrumb pageTitle="Invoice" />
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Stripe invoice record.
      </p>
      <div className="mt-4">
        <InvoiceDetailBody invoiceId={invoiceId} />
      </div>
    </div>
  );
}

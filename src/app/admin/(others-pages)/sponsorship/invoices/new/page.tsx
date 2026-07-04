import StripeInvoiceComposer from "@/components/billing/StripeInvoiceComposer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New invoice",
  description: "Create and send a Stripe invoice",
};

export default function SponsorshipInvoicesNewPage() {
  return (
    <div className="-mx-4 -mt-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 lg:-mx-6">
      <StripeInvoiceComposer />
    </div>
  );
}

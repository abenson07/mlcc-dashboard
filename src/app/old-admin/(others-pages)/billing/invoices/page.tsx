import { redirect } from "next/navigation";

export default function BillingInvoicesPage() {
  redirect("/old-admin/sponsorship?view=invoices");
}

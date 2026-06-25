import { redirect } from "next/navigation";

export default function BillingInvoicesPage() {
  redirect("/admin/sponsorship?view=invoices");
}

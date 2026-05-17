import { redirect } from "next/navigation";

export default function BillingInvoicesPage() {
  redirect("/sponsorship?view=invoices");
}

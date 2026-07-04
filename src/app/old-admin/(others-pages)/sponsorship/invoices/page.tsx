import { redirect } from "next/navigation";

export default function SponsorshipInvoicesPage() {
  redirect("/old-admin/sponsorship?view=invoices");
}

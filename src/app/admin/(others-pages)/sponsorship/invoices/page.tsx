import { redirect } from "next/navigation";

export default function SponsorshipInvoicesPage() {
  redirect("/admin/sponsorship?view=invoices");
}

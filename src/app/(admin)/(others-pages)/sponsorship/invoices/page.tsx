import { redirect } from "next/navigation";

export default function SponsorshipInvoicesPage() {
  redirect("/sponsorship?view=invoices");
}

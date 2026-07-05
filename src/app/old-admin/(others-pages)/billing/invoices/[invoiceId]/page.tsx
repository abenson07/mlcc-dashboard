import { redirect } from "next/navigation";

type Props = { params: Promise<{ invoiceId: string }> };

export default async function BillingInvoiceDetailPage({ params }: Props) {
  const { invoiceId } = await params;
  redirect(`/old-admin/sponsorship/invoices/${encodeURIComponent(invoiceId)}`);
}

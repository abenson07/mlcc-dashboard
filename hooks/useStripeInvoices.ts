"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";

export const STRIPE_INVOICES_QUERY_KEY = ["stripe-invoices"] as const;

async function fetchStripeInvoices(): Promise<StripeInvoiceTableRow[]> {
  const res = await fetch(`${getApiBase()}/api/stripe/invoices`);
  const data = (await res.json()) as { invoices?: StripeInvoiceTableRow[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Could not load invoices.");
  return (data.invoices ?? []).map((row) => ({
    ...row,
    catalog_product_ids: row.catalog_product_ids ?? [],
    sponsorship_category: row.sponsorship_category ?? null,
    created_by_name: row.created_by_name ?? null,
  }));
}

export function useStripeInvoices() {
  const { data: invoices = [], isLoading, error, refetch } = useQuery({
    queryKey: STRIPE_INVOICES_QUERY_KEY,
    queryFn: fetchStripeInvoices,
  });

  return {
    invoices,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load invoices") : null,
    refetch: async () => {
      await refetch();
    },
  };
}

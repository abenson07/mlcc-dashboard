"use client";

import { getApiBase } from "@/lib/apiBase";
import {
  formatDueDate,
  formatUsd,
  isOpenPastDue,
} from "@/components/billing/invoiceUtils";
import ComponentCard from "@/components/common/ComponentCard";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export type StripeInvoiceTableRow = {
  id: string;
  number: string | null;
  status: string | null;
  customer_email: string | null;
  amount_due: number;
  due_date: number | null;
  created: number;
  hosted_invoice_url: string | null;
  catalog_product_ids: string[];
};

const thClass =
  "px-4 py-3 text-left text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400";

export default function InvoicesListTable() {
  const [invoices, setInvoices] = useState<StripeInvoiceTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [remindingId, setRemindingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/stripe/invoices`);
      const data = (await res.json()) as {
        invoices?: StripeInvoiceTableRow[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Could not load invoices.");
      setInvoices(
        (data.invoices ?? []).map((row) => ({
          ...row,
          catalog_product_ids: row.catalog_product_ids ?? [],
        }))
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load invoices.");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const copyProductIds = async (inv: StripeInvoiceTableRow) => {
    const text = inv.catalog_product_ids.join(", ");
    if (!text) {
      toast.error("No catalog product on this invoice.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(
        inv.catalog_product_ids.length === 1
          ? "Product ID copied."
          : "Product IDs copied."
      );
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const sendReminder = async (invoiceId: string) => {
    setRemindingId(invoiceId);
    try {
      const res = await fetch(
        `${getApiBase()}/api/stripe/invoices/${encodeURIComponent(invoiceId)}/remind`,
        { method: "POST" }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Could not send reminder.");
      }
      toast.success("Stripe resent the invoice email.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send reminder.");
    } finally {
      setRemindingId(null);
    }
  };

  return (
    <ComponentCard
      title="Invoices"
      action={
        <Link
          href="/billing/invoices/new"
          className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 hover:text-white"
        >
          New invoice
        </Link>
      }
    >
      <div className="overflow-x-auto rounded-b-xl">
        <table className="min-w-full border-collapse border-t border-gray-100 dark:border-gray-800">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className={thClass}>Invoice</th>
              <th className={thClass}>Recipient</th>
              <th className={thClass}>Issued</th>
              <th className={thClass}>Due</th>
              <th className={thClass}>Amount</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  colSpan={7}
                >
                  Loading invoices…
                </td>
              </tr>
            ) : null}
            {!loading && invoices.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  colSpan={7}
                >
                  No invoices yet.{" "}
                  <Link
                    href="/billing/invoices/new"
                    className="font-medium text-brand-600 underline dark:text-brand-400"
                  >
                    Create one
                  </Link>
                  .
                </td>
              </tr>
            ) : null}
            {invoices.map((inv) => {
              const overdue = isOpenPastDue(inv);
              return (
                <tr
                  key={inv.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white/90">
                    <Link
                      href={`/billing/invoices/${encodeURIComponent(inv.id)}`}
                      className="font-medium text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
                    >
                      {inv.number ?? inv.id.slice(0, 14)}
                    </Link>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {inv.customer_email ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {formatDueDate(inv.created)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {inv.due_date === null ? "—" : formatDueDate(inv.due_date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-gray-900 dark:text-white/90">
                    {formatUsd(inv.amount_due)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                    <span className="capitalize">{inv.status ?? "—"}</span>
                    {overdue ? (
                      <span className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">
                        Past due
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={inv.catalog_product_ids.length === 0}
                        title={
                          inv.catalog_product_ids.length
                            ? `Copy: ${inv.catalog_product_ids.join(", ")}`
                            : "No Stripe catalog product on line items"
                        }
                        onClick={() => void copyProductIds(inv)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        Copy prod ID
                      </button>
                      <Link
                        href={`/billing/invoices/${encodeURIComponent(inv.id)}`}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
                      >
                        View
                      </Link>
                      {overdue ? (
                        <button
                          type="button"
                          disabled={remindingId === inv.id}
                          onClick={() => void sendReminder(inv.id)}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-500/35 dark:bg-amber-500/10 dark:text-amber-100 dark:hover:bg-amber-500/20"
                        >
                          {remindingId === inv.id ? "Sending…" : "Send reminder"}
                        </button>
                      ) : null}
                      {inv.hosted_invoice_url ? (
                        <a
                          href={inv.hosted_invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          Pay link
                        </a>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ComponentCard>
  );
}

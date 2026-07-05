"use client";

import ComponentCard from "@/components/common/ComponentCard";
import {
  formatDueDate,
  formatUsd,
  isOpenPastDue,
} from "@/components/billing/invoiceUtils";
import { getApiBase } from "@/lib/apiBase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type InvoicePayload = {
  id: string;
  number?: string | null;
  status: string | null;
  customer_email: string | null;
  amount_due: number | null;
  due_date: number | null;
  hosted_invoice_url: string | null;
  sponsorship_category?: string | null;
  event_id?: string | null;
  event_name?: string | null;
  created_by_name?: string | null;
};

export default function InvoiceDetailBody({
  invoiceId,
}: {
  invoiceId: string;
}) {
  const router = useRouter();
  const [inv, setInv] = useState<InvoicePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminding, setReminding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${getApiBase()}/api/stripe/invoices/${encodeURIComponent(invoiceId)}`
      );
      const data = (await res.json()) as InvoicePayload & { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Invoice not found.");
        setInv(null);
        return;
      }
      setInv(data);
    } catch {
      toast.error("Could not load invoice.");
      setInv(null);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const sendReminder = async () => {
    setReminding(true);
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
      setReminding(false);
    }
  };

  const overdue =
    inv &&
    isOpenPastDue({
      status: inv.status ?? null,
      due_date: inv.due_date,
    });

  if (loading) {
    return (
      <ComponentCard title="Invoice" desc="Loading…">
        <div className="min-h-[120px] px-6 pb-6" />
      </ComponentCard>
    );
  }

  if (!inv) {
    return (
      <ComponentCard title="Invoice" desc="">
        <div className="space-y-3 px-6 pb-6 text-sm text-gray-600 dark:text-gray-400">
          <p>We could not load this invoice.</p>
          <button
            type="button"
            onClick={() => router.push("/old-admin/sponsorship?view=invoices")}
            className="font-medium text-brand-600 underline dark:text-brand-400"
          >
            Back to list
          </button>
        </div>
      </ComponentCard>
    );
  }

  const amountCents = inv.amount_due ?? 0;

  return (
    <div className="space-y-6">
      <ComponentCard
        title={inv.number ? `Invoice ${inv.number}` : inv.id}
        desc={
          <span className="capitalize">
            Status: {inv.status ?? "—"}
            {overdue ? (
              <span className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">
                Past due
              </span>
            ) : null}
          </span>
        }
        action={
          <div className="flex flex-wrap gap-2">
            {overdue ? (
              <button
                type="button"
                disabled={reminding}
                onClick={() => void sendReminder()}
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-500/35 dark:bg-amber-500/10 dark:text-amber-100 dark:hover:bg-amber-500/20"
              >
                {reminding ? "Sending…" : "Send reminder"}
              </button>
            ) : null}
            {inv.hosted_invoice_url ? (
              <a
                href={inv.hosted_invoice_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                Open pay page
              </a>
            ) : null}
          </div>
        }
      >
        <div className="space-y-4 px-6 pb-6 text-sm">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Stripe id</dt>
              <dd className="mt-1 font-mono text-gray-900 dark:text-white/90">
                {inv.id}
              </dd>
            </div>
            {inv.customer_email ? (
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Recipient</dt>
                <dd className="mt-1 text-gray-900 dark:text-white/90">
                  {inv.customer_email}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Amount due</dt>
              <dd className="mt-1 tabular-nums text-gray-900 dark:text-white/90">
                {formatUsd(amountCents)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Due</dt>
              <dd className="mt-1 text-gray-900 dark:text-white/90">
                {formatDueDate(inv.due_date)}
              </dd>
            </div>
            {inv.event_name ? (
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Event</dt>
                <dd className="mt-1 text-gray-900 dark:text-white/90">
                  {inv.event_name}
                </dd>
              </div>
            ) : null}
            {inv.sponsorship_category ? (
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                <dd className="mt-1 text-gray-900 dark:text-white/90">
                  {inv.sponsorship_category}
                </dd>
              </div>
            ) : null}
          </dl>
          <p>
            <Link
              href="/old-admin/sponsorship?view=invoices"
              className="font-medium text-brand-600 underline dark:text-brand-400"
            >
              All invoices
            </Link>
          </p>
        </div>
      </ComponentCard>
    </div>
  );
}

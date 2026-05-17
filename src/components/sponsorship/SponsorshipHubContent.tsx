"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import TableViewTabs from "@/components/common/TableViewTabs";
import FilterPills from "@/components/common/FilterPills";
import TableWithDetailSidebar from "@/components/detail-sidebar/TableWithDetailSidebar";
import { getApiBase } from "@/lib/apiBase";
import { isOpenPastDue } from "@/components/billing/invoiceUtils";
import { INVOICE_CATEGORY_LABEL } from "@/lib/stripe/invoiceDashboardMetadata";
import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";
import {
  MercuryVariantTable,
  InvoiceSidebar,
  mercuryReadOnlySidebarTitle,
  type InvoiceRowActions,
} from "@/components/table/mercury-demo/mercuryVariantTable";
import { useMercuryPlaygroundData } from "@/components/table/mercury-demo/useMercuryPlaygroundData";
import SponsorshipTable from "./SponsorshipTable";

export type SponsorshipTableView = "sponsorships" | "invoices";

type InvoicePaymentFilter = "all" | "paid" | "unpaid" | "past_due";
type CategoryQuickFilter = "all" | "event" | "leaflet";

function parseSponsorshipView(sp: URLSearchParams | null): SponsorshipTableView {
  const raw = sp?.get("view");
  if (raw === "invoices") return "invoices";
  return "sponsorships";
}

function SponsorshipHubPane({
  view,
  setView,
}: {
  view: SponsorshipTableView;
  setView: (next: SponsorshipTableView) => void;
}) {
  const queryClient = useQueryClient();
  const mercury = useMercuryPlaygroundData("billing-invoices", {
    skip: view !== "invoices",
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<InvoicePaymentFilter>("all");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryQuickFilter>("all");

  const visibleInvoices = useMemo(() => {
    let rows = mercury.stripeInvoices;
    if (categoryFilter === "event") {
      rows = rows.filter(
        (r) => r.sponsorship_category === INVOICE_CATEGORY_LABEL.EVENT,
      );
    } else if (categoryFilter === "leaflet") {
      rows = rows.filter(
        (r) => r.sponsorship_category === INVOICE_CATEGORY_LABEL.LEAFLET,
      );
    }
    if (paymentFilter === "past_due") {
      rows = rows.filter((r) => isOpenPastDue(r));
    } else if (paymentFilter === "paid") {
      rows = rows.filter((r) => (r.status ?? "").toLowerCase() === "paid");
    } else if (paymentFilter === "unpaid") {
      rows = rows.filter(
        (r) =>
          (r.status ?? "").toLowerCase() === "open" && !isOpenPastDue(r),
      );
    }
    return rows;
  }, [mercury.stripeInvoices, categoryFilter, paymentFilter]);

  const selectedInvoice = useMemo(
    () => visibleInvoices.find((r) => r.id === selectedId) ?? null,
    [visibleInvoices, selectedId],
  );

  const copyProductIds = useCallback(async (inv: StripeInvoiceTableRow) => {
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
          : "Product IDs copied.",
      );
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }, []);

  const sendReminder = useCallback(
    async (invoiceId: string) => {
      setRemindingId(invoiceId);
      try {
        const res = await fetch(
          `${getApiBase()}/api/stripe/invoices/${encodeURIComponent(invoiceId)}/remind`,
          { method: "POST" },
        );
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          throw new Error(data.error || "Could not send reminder.");
        }
        toast.success("Stripe resent the invoice email.");
        await queryClient.invalidateQueries({
          queryKey: ["mercury-stripe-invoices"],
        });
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Could not send reminder.",
        );
      } finally {
        setRemindingId(null);
      }
    },
    [queryClient],
  );

  const invoiceRowActions: InvoiceRowActions = useMemo(
    () => ({
      onRemind: (id) => void sendReminder(id),
      remindingId,
      onCopyProductIds: (inv) => void copyProductIds(inv),
    }),
    [sendReminder, remindingId, copyProductIds],
  );

  const emptyInvoicesMessage =
    mercury.stripeInvoices.length === 0 ? (
      <>
        No sponsorship invoices from this dashboard yet. Create one with category
        tags{" "}
        <Link
          href="/sponsorship/invoices/new"
          className="font-medium text-brand-600 underline dark:text-brand-400"
        >
          here
        </Link>
        .
      </>
    ) : (
      "No invoices match these filters."
    );

  return (
    <TableWithDetailSidebar
      selectedItem={view === "invoices" ? selectedInvoice : null}
      onClose={() => setSelectedId(null)}
      sidebarTitle={mercuryReadOnlySidebarTitle(
        "billing-invoices",
        selectedInvoice,
      )}
      asideWidthClass="w-full max-w-[420px]"
      dashboardTable={{ showSelectColumn: true, showMenuColumn: true }}
      renderSidebar={(row) =>
        row ? <InvoiceSidebar inv={row} actions={invoiceRowActions} /> : null
      }
    >
      <ComponentCard hideHeader>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-mercury-line dark:border-white/10">
          <TableViewTabs<SponsorshipTableView>
            aria-label="Sponsorship data views"
            value={view}
            onChange={setView}
            className="min-w-0 flex-1 border-b-0"
            tabs={[
              { value: "sponsorships", label: "Sponsorships" },
              { value: "invoices", label: "Invoices" },
            ]}
          />
          {view === "invoices" ? (
            <Link
              href="/sponsorship/invoices/new"
              className="mb-2 inline-flex shrink-0 items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 hover:text-white"
            >
              New invoice
            </Link>
          ) : null}
        </div>

        {view === "sponsorships" ? <SponsorshipTable /> : null}

        {view === "invoices" ? (
          <>
            <FilterPills<InvoicePaymentFilter>
              aria-label="Invoice payment status"
              value={paymentFilter}
              onChange={setPaymentFilter}
              className="pt-4"
              pills={[
                { value: "all", label: "All" },
                { value: "paid", label: "Paid" },
                { value: "unpaid", label: "Unpaid" },
                { value: "past_due", label: "Past due" },
              ]}
            />
            <FilterPills<CategoryQuickFilter>
              aria-label="Invoice category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              className="pt-2"
              pills={[
                { value: "all", label: "All categories" },
                { value: "event", label: "Event" },
                { value: "leaflet", label: "Leaflet" },
              ]}
            />
            <MercuryVariantTable
              key="billing-invoices"
              variant="billing-invoices"
              mercury={mercury}
              selectedKey={selectedId}
              onSelectKey={setSelectedId}
              invoiceRowsOverride={visibleInvoices}
              invoiceRowActions={invoiceRowActions}
              emptyInvoicesMessage={emptyInvoicesMessage}
            />
          </>
        ) : null}
      </ComponentCard>
    </TableWithDetailSidebar>
  );
}

export default function SponsorshipHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = useMemo(
    () => parseSponsorshipView(searchParams),
    [searchParams],
  );

  const setView = (next: SponsorshipTableView) => {
    const href =
      next === "sponsorships" ? "/sponsorship" : "/sponsorship?view=invoices";
    router.replace(href);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Sponsorship" />
      <div className="mt-2 space-y-4">
        <SponsorshipHubPane key={view} view={view} setView={setView} />
      </div>
    </div>
  );
}

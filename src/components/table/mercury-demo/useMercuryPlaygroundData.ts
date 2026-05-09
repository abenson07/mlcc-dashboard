"use client";

import { useQuery } from "@tanstack/react-query";
import { useBusinesses, usePeople, useRoutes } from "hooks";
import { getApiBase } from "@/lib/apiBase";
import type { DuplicateMember } from "@/app/api/stripe/duplicate-members/route";
import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";
import type { MercuryVariantId } from "./types";

async function fetchDuplicateMembers(): Promise<DuplicateMember[]> {
  const res = await fetch(`${getApiBase()}/api/stripe/duplicate-members`);
  const data = (await res.json()) as { duplicateMembers?: DuplicateMember[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed: ${res.status}`);
  return data.duplicateMembers ?? [];
}

async function fetchStripeInvoices(): Promise<StripeInvoiceTableRow[]> {
  const res = await fetch(`${getApiBase()}/api/stripe/invoices`);
  const data = (await res.json()) as { invoices?: StripeInvoiceTableRow[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Could not load invoices.");
  return (data.invoices ?? []).map((row) => ({
    ...row,
    catalog_product_ids: row.catalog_product_ids ?? [],
  }));
}

export function useMercuryPlaygroundData(variant: MercuryVariantId) {
  const neighborsAll = usePeople({
    autoFetch: variant === "neighbors-all",
    filters: {},
  });

  const neighborsMembers = usePeople({
    autoFetch: variant === "neighbors-members",
    filters: { hasMembership: true, membershipStatus: "active" },
  });

  const routesAll = useRoutes({
    autoFetch: variant === "routes-all",
    filters: {},
  });

  const routesClaimed = useRoutes({
    autoFetch: variant === "routes-claimed",
    filters: { claimedOnly: true },
  });

  const routesOpen = useRoutes({
    autoFetch: variant === "routes-open",
    filters: { openOnly: true },
  });

  const businessesBundle = useBusinesses({
    autoFetch: variant === "businesses-all" || variant === "businesses-members",
    filters: {},
  });

  const dupQuery = useQuery({
    queryKey: ["mercury-stripe-duplicate-members"],
    queryFn: fetchDuplicateMembers,
    enabled: variant === "neighbors-duplicate-memberships",
  });

  const invoicesQuery = useQuery({
    queryKey: ["mercury-stripe-invoices"],
    queryFn: fetchStripeInvoices,
    enabled: variant === "billing-invoices",
  });

  const businessesMembersFiltered =
    variant === "businesses-members"
      ? businessesBundle.businesses.filter((b) => b.membership?.status?.toLowerCase() === "active")
      : [];

  let activeLoading = false;
  let activeError: string | null = null;

  switch (variant) {
    case "neighbors-all":
      activeLoading = neighborsAll.loading;
      activeError = neighborsAll.error;
      break;
    case "neighbors-members":
      activeLoading = neighborsMembers.loading;
      activeError = neighborsMembers.error;
      break;
    case "neighbors-duplicate-memberships":
      activeLoading = dupQuery.isPending;
      activeError = dupQuery.error instanceof Error ? dupQuery.error.message : dupQuery.error ? String(dupQuery.error) : null;
      break;
    case "routes-all":
      activeLoading = routesAll.loading;
      activeError = routesAll.error;
      break;
    case "routes-claimed":
      activeLoading = routesClaimed.loading;
      activeError = routesClaimed.error;
      break;
    case "routes-open":
      activeLoading = routesOpen.loading;
      activeError = routesOpen.error;
      break;
    case "businesses-all":
      activeLoading = businessesBundle.loading;
      activeError = businessesBundle.error;
      break;
    case "businesses-members":
      activeLoading = businessesBundle.loading;
      activeError = businessesBundle.error;
      break;
    case "billing-invoices":
      activeLoading = invoicesQuery.isPending;
      activeError = invoicesQuery.error instanceof Error ? invoicesQuery.error.message : invoicesQuery.error ? String(invoicesQuery.error) : null;
      break;
    default:
      activeLoading = false;
      activeError = null;
  }

  return {
    neighborsAllPeople: neighborsAll.people,
    neighborsMembersPeople: neighborsMembers.people,
    routesAllList: routesAll.routes,
    routesClaimedList: routesClaimed.routes,
    routesOpenList: routesOpen.routes,
    businessesAllList: businessesBundle.businesses,
    businessesMembersList: businessesMembersFiltered,
    duplicateMembers: dupQuery.data ?? [],
    stripeInvoices: invoicesQuery.data ?? [],
    activeLoading,
    activeError,
  };
}

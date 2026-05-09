"use client";

import { useQuery } from "@tanstack/react-query";
import { useBusinesses, usePeople, useRoutes } from "hooks";
import { getApiBase } from "@/lib/apiBase";
import type { DuplicateMember } from "@/app/api/stripe/duplicate-members/route";
import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";
import type { MercuryVariantId } from "./types";

export interface UseMercuryPlaygroundDataOptions {
  /** When true, no Supabase/Stripe queries run for this hook instance. */
  skip?: boolean;
}

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
    sponsorship_category: row.sponsorship_category ?? null,
    created_by_name: row.created_by_name ?? null,
  }));
}

export function useMercuryPlaygroundData(
  variant: MercuryVariantId,
  options?: UseMercuryPlaygroundDataOptions,
) {
  const skip = options?.skip ?? false;

  const neighborsAll = usePeople({
    autoFetch: !skip && variant === "neighbors-all",
    filters: {},
  });

  const neighborsMembers = usePeople({
    autoFetch: !skip && variant === "neighbors-members",
    filters: { hasMembership: true, membershipStatus: "active" },
  });

  const routesAll = useRoutes({
    autoFetch: !skip && variant === "routes-all",
    filters: {},
  });

  const routesClaimed = useRoutes({
    autoFetch: !skip && variant === "routes-claimed",
    filters: { claimedOnly: true },
  });

  const routesOpen = useRoutes({
    autoFetch: !skip && variant === "routes-open",
    filters: { openOnly: true },
  });

  const businessesBundle = useBusinesses({
    autoFetch: !skip && (variant === "businesses-all" || variant === "businesses-members"),
    filters: {},
  });

  const dupQuery = useQuery({
    queryKey: ["mercury-stripe-duplicate-members"],
    queryFn: fetchDuplicateMembers,
    enabled: !skip && variant === "neighbors-duplicate-memberships",
  });

  const invoicesQuery = useQuery({
    queryKey: ["mercury-stripe-invoices"],
    queryFn: fetchStripeInvoices,
    enabled: !skip && variant === "billing-invoices",
  });

  const businessesMembersFiltered =
    variant === "businesses-members"
      ? businessesBundle.businesses.filter((b) => b.membership?.status?.toLowerCase() === "active")
      : [];

  let activeLoading = false;
  let activeError: string | null = null;

  switch (variant) {
    case "neighbors-all":
      activeLoading = skip ? false : neighborsAll.loading;
      activeError = skip ? null : neighborsAll.error;
      break;
    case "neighbors-members":
      activeLoading = skip ? false : neighborsMembers.loading;
      activeError = skip ? null : neighborsMembers.error;
      break;
    case "neighbors-duplicate-memberships":
      activeLoading = skip ? false : dupQuery.isPending;
      activeError = skip
        ? null
        : dupQuery.error instanceof Error
          ? dupQuery.error.message
          : dupQuery.error
            ? String(dupQuery.error)
            : null;
      break;
    case "routes-all":
      activeLoading = skip ? false : routesAll.loading;
      activeError = skip ? null : routesAll.error;
      break;
    case "routes-claimed":
      activeLoading = skip ? false : routesClaimed.loading;
      activeError = skip ? null : routesClaimed.error;
      break;
    case "routes-open":
      activeLoading = skip ? false : routesOpen.loading;
      activeError = skip ? null : routesOpen.error;
      break;
    case "businesses-all":
      activeLoading = skip ? false : businessesBundle.loading;
      activeError = skip ? null : businessesBundle.error;
      break;
    case "businesses-members":
      activeLoading = skip ? false : businessesBundle.loading;
      activeError = skip ? null : businessesBundle.error;
      break;
    case "billing-invoices":
      activeLoading = skip ? false : invoicesQuery.isPending;
      activeError = skip
        ? null
        : invoicesQuery.error instanceof Error
          ? invoicesQuery.error.message
          : invoicesQuery.error
            ? String(invoicesQuery.error)
            : null;
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

export type MercuryPlaygroundData = ReturnType<typeof useMercuryPlaygroundData>;

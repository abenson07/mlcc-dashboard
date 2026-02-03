"use client";

import ComponentCard from "@/components/common/ComponentCard";
import { CopyableEmail } from "@/components/common/CopyableEmail";
import DelivererRoutesTable from "@/components/tables/DelivererRoutesTable";
import { useRoutes } from "hooks";
import type { RouteWithDeliverer } from "hooks";
import type { People } from "@/types/database";
import React, { useState } from "react";
import { toast } from "sonner";

function getRoutesByDeliverer(
  routes: RouteWithDeliverer[]
): Map<string, { deliverer: People; routes: RouteWithDeliverer[] }> {
  const map = new Map<string, { deliverer: People; routes: RouteWithDeliverer[] }>();

  for (const route of routes) {
    const primary = route.primary_deliverer;
    const secondary = route.secondary_deliverer;
    const isSkipped = route.is_skipped === true;

    // Skipped routes show only under secondary; non-skipped show under primary (and secondary if different)
    if (primary && !isSkipped) {
      const existing = map.get(primary.id);
      if (existing) {
        existing.routes.push(route);
      } else {
        map.set(primary.id, { deliverer: primary, routes: [route] });
      }
    }
    if (secondary && secondary.id !== route.primary_deliverer_id) {
      const existing = map.get(secondary.id);
      if (existing) {
        existing.routes.push(route);
      } else {
        map.set(secondary.id, { deliverer: secondary, routes: [route] });
      }
    }
  }

  return map;
}

function formatRoutesForCopy(routes: RouteWithDeliverer[]): string {
  return routes
    .map((r) => `${r.route_name} | ${r.leaflet_count ?? "—"}`)
    .join(",\n");
}

function CopyRoutesButton({ routes }: { routes: RouteWithDeliverer[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = formatRoutesForCopy(routes);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Routes copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  if (routes.length === 0) return null;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-500"
      title="Copy all routes (Name | Leaflet Count)"
    >
      {copied ? (
        <>
          <span className="size-4 text-green-500" aria-hidden>✓</span>
          <span>Copied</span>
        </>
      ) : (
        <>
          <svg className="size-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Copy routes</span>
        </>
      )}
    </button>
  );
}

export default function DeliverersContent() {
  const { routes, loading, error } = useRoutes({
    autoFetch: true,
    filters: { claimedOnly: true },
  });

  if (loading) {
    return (
      <ComponentCard title="Deliverers">
        <p className="text-gray-500 dark:text-gray-400">Loading deliverers...</p>
      </ComponentCard>
    );
  }

  if (error) {
    return (
      <ComponentCard title="Deliverers">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </ComponentCard>
    );
  }

  const byDeliverer = getRoutesByDeliverer(routes);
  const deliverers = Array.from(byDeliverer.entries())
    .map(([, data]) => data)
    .sort((a, b) => a.deliverer.full_name.localeCompare(b.deliverer.full_name));

  if (deliverers.length === 0) {
    return (
      <ComponentCard title="Deliverers">
        <p className="text-gray-500 dark:text-gray-400">
          No deliverers with claimed routes found.
        </p>
      </ComponentCard>
    );
  }

  return (
    <>
      {deliverers.map(({ deliverer, routes: delivererRoutes }) => (
        <ComponentCard
          key={deliverer.id}
          title={deliverer.full_name}
          desc={<CopyableEmail email={deliverer.email} className="text-sm text-gray-500 dark:text-gray-400" />}
          action={<CopyRoutesButton routes={delivererRoutes} />}
        >
          <DelivererRoutesTable routes={delivererRoutes} />
        </ComponentCard>
      ))}
    </>
  );
}

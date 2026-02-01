"use client";

import ComponentCard from "@/components/common/ComponentCard";
import DelivererRoutesTable from "@/components/tables/DelivererRoutesTable";
import { useRoutes } from "hooks";
import type { RouteWithDeliverer } from "hooks";
import type { People } from "@/types/database";
import React from "react";

function getRoutesByDeliverer(
  routes: RouteWithDeliverer[]
): Map<string, { deliverer: People; routes: RouteWithDeliverer[] }> {
  const map = new Map<string, { deliverer: People; routes: RouteWithDeliverer[] }>();

  for (const route of routes) {
    const primary = route.primary_deliverer;
    const secondary = route.secondary_deliverer;

    if (primary) {
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
          desc={deliverer.email ?? undefined}
        >
          <DelivererRoutesTable routes={delivererRoutes} />
        </ComponentCard>
      ))}
    </>
  );
}

"use client";

import React from "react";
import type { RouteWithDeliverer } from "hooks";
import { CopyableEmail } from "@/components/common/CopyableEmail";

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

interface RouteDetailSidebarProps {
  route: RouteWithDeliverer;
}

export default function RouteDetailSidebar({ route }: RouteDetailSidebarProps) {
  const primary = route.primary_deliverer;
  const secondary = route.secondary_deliverer;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Route name
        </p>
        <p className="mt-1 text-sm text-gray-800 dark:text-white/90">{route.route_name}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Route type
        </p>
        <p className="mt-1 text-sm text-gray-800 dark:text-white/90">{route.route_type ?? "—"}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Leaflet count
        </p>
        <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
          {route.leaflet_count ?? "—"}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Primary deliverer
        </p>
        {primary ? (
          <div className="mt-1">
            <p className="text-sm text-gray-800 dark:text-white/90">{primary.full_name}</p>
            {primary.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <CopyableEmail email={primary.email} />
              </p>
            )}
          </div>
        ) : (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">—</p>
        )}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Secondary deliverer
        </p>
        {secondary ? (
          <div className="mt-1">
            <p className="text-sm text-gray-800 dark:text-white/90">{secondary.full_name}</p>
            {secondary.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <CopyableEmail email={secondary.email} />
              </p>
            )}
          </div>
        ) : (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">—</p>
        )}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Skipped
        </p>
        <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
          {route.is_skipped === true ? "Yes" : "No"}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Created at
        </p>
        <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
          {formatDate(route.created_at)}
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { CopyableEmail } from "@/components/common/CopyableEmail";
import { useRoutes } from "hooks";
import type { RouteWithDeliverer } from "hooks";

function getDelivererDisplay(route: RouteWithDeliverer): {
  name: string;
  email: string | null;
} | null {
  const primary = route.primary_deliverer;
  const secondary = route.secondary_deliverer;
  if (primary) {
    return { name: primary.full_name, email: primary.email ?? null };
  }
  if (secondary) {
    return { name: secondary.full_name, email: secondary.email ?? null };
  }
  return null;
}

/** Button for Claimed Routes card header: reset is_skipped and clear secondary_deliverer on all claimed routes that have them */
export function ClaimedRoutesHeaderAction() {
  const { routes, update, refetch } = useRoutes({
    autoFetch: true,
    filters: { claimedOnly: true },
  });
  const [busy, setBusy] = useState(false);

  const needReset = routes.filter(
    (r) => r.is_skipped === true || (r.secondary_deliverer_id ?? null) != null
  );

  const handleReset = async () => {
    if (needReset.length === 0) return;
    const count = needReset.length;
    if (
      !window.confirm(
        `Reset skipped status and remove secondary deliverer from ${count} route${count === 1 ? "" : "s"}?`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      for (const route of needReset) {
        await update(route.id, {
          is_skipped: false,
          secondary_deliverer_id: null,
        });
      }
      await refetch();
    } finally {
      setBusy(false);
    }
  };

  if (needReset.length === 0) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReset}
      disabled={busy}
    >
      {busy ? "Resetting…" : "Reset skipped & remove secondary"}
    </Button>
  );
}

export default function ClaimedRoutesTable() {
  const { routes, loading, error, update } = useRoutes({
    autoFetch: true,
    filters: { claimedOnly: true },
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400">Loading claimed routes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-xl border border-red-200 bg-white p-8 text-center dark:border-red-900/30 dark:bg-white/[0.03]">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[600px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Route
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Leaflet count
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Deliverer
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {routes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No claimed routes found.
                  </TableCell>
                </TableRow>
              ) : (
                routes.map((route) => {
                  const deliverer = getDelivererDisplay(route);
                  const isRowBusy = updatingId === route.id;
                  const handleRemove = async () => {
                    if (
                      !window.confirm(
                        "Remove this route from the deliverer? The route will become open."
                      )
                    ) {
                      return;
                    }
                    setUpdatingId(route.id);
                    try {
                      await update(route.id, {
                        primary_deliverer_id: null,
                        secondary_deliverer_id: null,
                        primary_deliverer_email: null,
                        is_skipped: false,
                      });
                    } finally {
                      setUpdatingId(null);
                    }
                  };
                  const handleSkip = async () => {
                    if (
                      !window.confirm(
                        "Mark this deliverer as skipped? The route will appear in Open Routes so a secondary deliverer can be added."
                      )
                    ) {
                      return;
                    }
                    setUpdatingId(route.id);
                    try {
                      await update(route.id, { is_skipped: true });
                    } finally {
                      setUpdatingId(null);
                    }
                  };
                  return (
                    <TableRow key={route.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex flex-col gap-0.5">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {route.route_name}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {route.route_type ?? "—"}
                          </span>
                          {route.is_skipped && (
                            <span className="inline-flex w-fit rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                              Skipped
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {route.leaflet_count ?? "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <div className="flex flex-col gap-0.5">
                          {route.primary_deliverer && (
                            <div className="flex flex-col">
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {route.primary_deliverer.full_name}
                              </span>
                              <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                <CopyableEmail email={route.primary_deliverer.email} />
                              </span>
                            </div>
                          )}
                          {route.secondary_deliverer && (
                            <div className="flex flex-col mt-1 text-theme-xs">
                              <span className="text-gray-500 dark:text-gray-400">
                                + {route.secondary_deliverer.full_name}
                              </span>
                            </div>
                          )}
                          {!route.primary_deliverer && !route.secondary_deliverer && (
                            <span className="text-gray-500 dark:text-gray-400">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSkip}
                            disabled={isRowBusy || route.is_skipped === true}
                          >
                            Skip
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRemove}
                            disabled={isRowBusy}
                          >
                            Unassign
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

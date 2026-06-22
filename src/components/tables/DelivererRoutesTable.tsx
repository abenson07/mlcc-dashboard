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
import { useRoutes } from "hooks";
import type { RouteWithDeliverer } from "hooks";

interface DelivererRoutesTableProps {
  routes: RouteWithDeliverer[];
}

/** Table of routes without deliverer column (for per-deliverer view). */
export default function DelivererRoutesTable({ routes }: DelivererRoutesTableProps) {
  const { update } = useRoutes({
    autoFetch: true,
    filters: { claimedOnly: true },
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Leaflet count
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
                    colSpan={3}
                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No routes found.
                  </TableCell>
                </TableRow>
              ) : (
                routes.map((route) => {
                  const isRowBusy = updatingId === route.id;
                  const handleRemove = async () => {
                    setUpdatingId(route.id);
                    try {
                      await update(route.id, {
                        primary_deliverer_id: null,
                        primary_deliverer_email: null,
                      });
                    } finally {
                      setUpdatingId(null);
                    }
                  };
                  return (
                    <TableRow key={route.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span
                            className="block max-w-[50ch] truncate font-medium text-gray-800 text-theme-sm dark:text-white/90"
                            title={route.route_name?.trim() ? route.route_name : undefined}
                          >
                            {route.route_name}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {route.route_type ?? "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                        {route.leaflet_count ?? "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemove}
                          disabled={isRowBusy}
                        >
                          Unassign
                        </Button>
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

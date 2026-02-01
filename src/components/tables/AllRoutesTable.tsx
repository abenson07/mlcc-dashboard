"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
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

function isCovered(route: RouteWithDeliverer): boolean {
  return !!(route.primary_deliverer_id || route.secondary_deliverer_id);
}

export default function AllRoutesTable() {
  const { routes, loading, error } = useRoutes({ autoFetch: true });

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400">Loading routes...</p>
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
        <div className="min-w-[700px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Project Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Deliverer
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
                    No routes found.
                  </TableCell>
                </TableRow>
              ) : (
                routes.map((route) => {
                  const deliverer = getDelivererDisplay(route);
                  const covered = isCovered(route);
                  return (
                    <TableRow key={route.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex flex-col">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {route.route_name}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {route.route_type ?? "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {route.leaflet_count ?? "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={covered ? "success" : "warning"}
                        >
                          {covered ? "Covered" : "Uncovered"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        {deliverer ? (
                          <div className="flex flex-col">
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {deliverer.name}
                            </span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              {deliverer.email ?? "—"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            —
                          </span>
                        )}
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

"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RouteWithDeliverer } from "hooks";

interface DelivererRoutesTableProps {
  routes: RouteWithDeliverer[];
}

/** Table of routes without deliverer column (for per-deliverer view) */
export default function DelivererRoutesTable({ routes }: DelivererRoutesTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[400px]">
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
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {routes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No routes found.
                  </TableCell>
                </TableRow>
              ) : (
                routes.map((route) => (
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

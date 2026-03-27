"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DuplicateMemberSubscription } from "@/app/api/stripe/duplicate-members/route";

interface DuplicateMemberSubscriptionsTableProps {
  subscriptions: DuplicateMemberSubscription[];
}

function formatTimestamp(ts: number): string {
  try {
    return new Date(ts * 1000).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

/** Table of subscription rows for one duplicate member (same layout style as DelivererRoutesTable). */
export default function DuplicateMemberSubscriptionsTable({
  subscriptions,
}: DuplicateMemberSubscriptionsTableProps) {
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
                  Subscription
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Product
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                >
                  Current period
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No subscriptions.
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex flex-col gap-0.5">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 font-mono">
                          {sub.id}
                        </span>
                        {sub.priceId !== "—" && (
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400 font-mono">
                            {sub.priceId}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                      {sub.productName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <span className="inline-flex rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-200">
                        {sub.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end text-gray-500 text-theme-sm dark:text-gray-400">
                      {sub.currentPeriodStart != null && sub.currentPeriodEnd != null
                        ? `${formatTimestamp(sub.currentPeriodStart)} – ${formatTimestamp(sub.currentPeriodEnd)}`
                        : "—"}
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

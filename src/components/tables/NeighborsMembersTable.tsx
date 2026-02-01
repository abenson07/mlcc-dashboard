"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePeople } from "hooks";

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function NeighborsMembersTable() {
  const { people, loading, error } = usePeople({
    autoFetch: true,
    filters: { hasMembership: true, membershipStatus: "active" },
  });

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400">Loading members...</p>
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
                  Address
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Membership
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Payment
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {people.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No active members found.
                  </TableCell>
                </TableRow>
              ) : (
                people.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex flex-col">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {person.full_name}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {person.email ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {person.address ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex flex-col">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {person.membership?.tier ?? "—"}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {formatDate(person.membership?.created_at ?? null)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex flex-col">
                        <span className="block text-gray-800 text-theme-sm dark:text-white/90">
                          {person.membership?.payment_method ?? "—"}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {formatDate(person.membership?.last_renewal ?? null)}
                        </span>
                      </div>
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

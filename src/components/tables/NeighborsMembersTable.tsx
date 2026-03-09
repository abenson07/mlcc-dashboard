"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CopyableEmail } from "@/components/common/CopyableEmail";
import { usePeople } from "hooks";
import type { PersonWithMembership } from "hooks";

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

function isWithinLast30Days(dateString: string | null): boolean {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  } catch {
    return false;
  }
}

interface NeighborsMembersTableProps {
  onRowClick?: (person: PersonWithMembership) => void;
}

export default function NeighborsMembersTable({
  onRowClick,
}: NeighborsMembersTableProps = {}) {
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

  const newMembers = people.filter((person) =>
    isWithinLast30Days(person.membership?.created_at ?? null)
  );

  const tableHeaderCells = (
    <>
      <TableCell
        isHeader
        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
      >
        Member
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
    </>
  );

  const renderMemberRow = (person: PersonWithMembership, clickable: boolean) => (
    <TableRow
      key={person.id}
      onClick={clickable && onRowClick ? () => onRowClick(person) : undefined}
    >
      <TableCell className="px-5 py-4 sm:px-6 text-start">
        <div className="flex flex-col">
          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {person.full_name}
          </span>
          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
            <CopyableEmail email={person.email} />
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
  );

  return (
    <div className="space-y-6">
      {/* New Members (Last 30 Days) */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.05]">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            New Members (Last 30 Days)
          </h3>
        </div>
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[700px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>{tableHeaderCells}</TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {newMembers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No new members in the last 30 days.
                    </TableCell>
                  </TableRow>
                ) : (
                  newMembers.map((person) => renderMemberRow(person, false))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* All active members (clickable when onRowClick is passed) */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.05]">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            All Active Members
          </h3>
        </div>
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[700px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>{tableHeaderCells}</TableRow>
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
                  people.map((person) => renderMemberRow(person, true))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TableRowActionsMenu,
  type TableRowMenuItem,
} from "@/components/ui/table/TableRowActionsMenu";
import type { VolunteerAskWithSignups } from "hooks";
import {
  formatCommitmentTypeLabel,
  formatVolunteerCommitment,
} from "@/lib/volunteers/formatCommitment";

function formatEventLabel(ask: VolunteerAskWithSignups): string {
  const name = ask.event?.name?.trim();
  if (name) return name;
  if (ask.event_id) return "Untitled event";
  return "—";
}

interface VolunteerAsksTableProps {
  asks: VolunteerAskWithSignups[];
  onEdit?: (ask: VolunteerAskWithSignups) => void;
  onDelete?: (ask: VolunteerAskWithSignups) => void;
  deletingId?: string | null;
}

function HeaderCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TableCell
      isHeader
      className={`px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 ${className}`}
    >
      {children}
    </TableCell>
  );
}

function RemainingBadge({
  remaining,
  needed,
}: {
  remaining: number;
  needed: number;
}) {
  const filled = remaining === 0;
  const tone = filled
    ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400"
    : remaining <= Math.max(1, Math.floor(needed / 2))
      ? "bg-warning-50 text-warning-800 dark:bg-warning-500/15 dark:text-warning-300"
      : "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/80";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      {remaining}
    </span>
  );
}

function rowMenuItems(
  ask: VolunteerAskWithSignups,
  onEdit: VolunteerAsksTableProps["onEdit"],
  onDelete: VolunteerAsksTableProps["onDelete"],
  deletingId: string | null
): TableRowMenuItem[] {
  const items: TableRowMenuItem[] = [];
  if (onEdit) {
    items.push({ label: "Edit", onClick: () => onEdit(ask) });
  }
  if (onDelete) {
    items.push({
      label: deletingId === ask.id ? "Deleting…" : "Delete",
      onClick: () => onDelete(ask),
      disabled: deletingId === ask.id,
      variant: "danger",
    });
  }
  return items;
}

export default function VolunteerAsksTable({
  asks,
  onEdit,
  onDelete,
  deletingId = null,
}: VolunteerAsksTableProps) {
  if (asks.length === 0) {
    return (
      <p className="py-10 text-center text-mercury-muted dark:text-white/50">
        No volunteer asks yet. Add opportunities in Supabase or wire up a create form here.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <HeaderCell>Title</HeaderCell>
                <HeaderCell>Event</HeaderCell>
                <HeaderCell>Type</HeaderCell>
                <HeaderCell>Time commitment</HeaderCell>
                <HeaderCell className="text-center">Needed</HeaderCell>
                <HeaderCell className="text-center">Signed up</HeaderCell>
                <HeaderCell className="text-center">Remaining</HeaderCell>
                <HeaderCell>Description</HeaderCell>
                {(onEdit || onDelete) && (
                  <HeaderCell className="w-10 px-1" aria-hidden />
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {asks.map((ask) => (
                <TableRow key={ask.id}>
                  <TableCell className="px-5 py-4 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {ask.title}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatEventLabel(ask)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatCommitmentTypeLabel(ask.commitment_type)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatVolunteerCommitment(ask)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center text-gray-800 text-theme-sm dark:text-white/90">
                    {ask.quantity}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center text-gray-800 text-theme-sm dark:text-white/90">
                    {ask.signup_count}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <RemainingBadge remaining={ask.remaining_slots} needed={ask.quantity} />
                  </TableCell>
                  <TableCell className="max-w-[28ch] px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <span className="line-clamp-2" title={ask.description ?? undefined}>
                      {ask.description?.trim() || "—"}
                    </span>
                  </TableCell>
                  {(onEdit || onDelete) && (
                    <TableCell
                      className="w-10 overflow-visible px-1 py-3 text-end align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TableRowActionsMenu
                        items={rowMenuItems(ask, onEdit, onDelete, deletingId)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

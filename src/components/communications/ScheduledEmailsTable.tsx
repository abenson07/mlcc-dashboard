"use client";

import FilterPills from "@/components/common/FilterPills";
import ScheduleEmailModal from "@/components/communications/ScheduleEmailModal";
import type { ScheduledEmailRow } from "@/lib/marketing/scheduledEmailTypes";
import { useModal } from "@/hooks/useModal";
import { getApiBase } from "@/lib/apiBase";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type StatusFilter = "all" | "scheduled" | "sent" | "other";

const thClass =
  "px-4 py-3 text-left text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusLabel(status: string): string {
  const normalized = status.toLowerCase().replace(/_/g, " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "scheduled" || s === "sending") {
    return "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";
  }
  if (s === "sent") {
    return "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300";
  }
  if (s === "failed") {
    return "bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300";
  }
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

function matchesFilter(row: ScheduledEmailRow, filter: StatusFilter): boolean {
  const s = row.status.toLowerCase();
  if (filter === "all") return true;
  if (filter === "scheduled") {
    return s === "scheduled" || s === "sending" || s === "draft";
  }
  if (filter === "sent") return s === "sent";
  return s !== "scheduled" && s !== "sending" && s !== "sent" && s !== "draft";
}

export default function ScheduledEmailsTable() {
  const { isOpen, openModal, closeModal } = useModal();
  const [rows, setRows] = useState<ScheduledEmailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/marketing/email/broadcasts`);
      const data = (await res.json()) as {
        broadcasts?: ScheduledEmailRow[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Could not load scheduled emails.");
      }
      setRows(data.broadcasts ?? []);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not load scheduled emails.",
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleRows = useMemo(() => {
    return rows.filter((row) => matchesFilter(row, statusFilter));
  }, [rows, statusFilter]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <FilterPills<StatusFilter>
          aria-label="Broadcast status"
          value={statusFilter}
          onChange={setStatusFilter}
          pills={[
            { value: "all", label: "All" },
            { value: "scheduled", label: "Upcoming" },
            { value: "sent", label: "Sent" },
            { value: "other", label: "Other" },
          ]}
        />
        <button
          type="button"
          onClick={openModal}
          className="inline-flex shrink-0 items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 hover:text-white"
        >
          Schedule email
        </button>
      </div>

      <div className="overflow-x-auto rounded-b-xl pt-4">
          <table className="min-w-full border-collapse border-t border-gray-100 dark:border-gray-800">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className={thClass}>Subject</th>
                <th className={thClass}>Scheduled for</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Sent</th>
                <th className={thClass}>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Loading scheduled sends…
                  </td>
                </tr>
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {rows.length === 0
                      ? "No broadcasts yet. Schedule your first email."
                      : "No broadcasts match this filter."}
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                  >
                    <td className="max-w-xs px-4 py-3 text-sm text-gray-900 dark:text-white/90">
                      <span className="line-clamp-2">
                        {row.subject?.trim() || "Untitled broadcast"}
                      </span>
                      <span className="mt-0.5 block font-mono text-xs text-gray-400 dark:text-gray-500">
                        {row.id.slice(0, 8)}…
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatDateTime(row.scheduled_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(row.status)}`}
                      >
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatDateTime(row.sent_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatDateTime(row.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </div>

      <ScheduleEmailModal
        isOpen={isOpen}
        onClose={closeModal}
        onScheduled={() => void load()}
      />
    </>
  );
}

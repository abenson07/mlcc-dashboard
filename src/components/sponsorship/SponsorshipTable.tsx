"use client";

import { useMemo, useState } from "react";
import FilterPills from "@/components/common/FilterPills";

export type SponsorshipSlotStatus = "open" | "filled" | "paid";

export type EventSponsorshipRow = {
  id: string;
  eventName: string;
  eventDate: string;
  tier: string;
  businessName: string | null;
  amount: number;
  status: SponsorshipSlotStatus;
};

export const HARDCODED_EVENT_SPONSORSHIPS: EventSponsorshipRow[] = [
  {
    id: "sb-1",
    eventName: "Summer Block Party",
    eventDate: "2026-06-14",
    tier: "Title sponsor",
    businessName: null,
    amount: 5000,
    status: "open",
  },
  {
    id: "sb-2",
    eventName: "Summer Block Party",
    eventDate: "2026-06-14",
    tier: "Gold",
    businessName: "Lakeview Bakery",
    amount: 1500,
    status: "filled",
  },
  {
    id: "sb-3",
    eventName: "Summer Block Party",
    eventDate: "2026-06-14",
    tier: "Silver",
    businessName: "North End Hardware",
    amount: 750,
    status: "paid",
  },
  {
    id: "sb-4",
    eventName: "Fall Festival",
    eventDate: "2026-10-03",
    tier: "Title sponsor",
    businessName: "Harbor Coffee Co.",
    amount: 4500,
    status: "paid",
  },
  {
    id: "sb-5",
    eventName: "Fall Festival",
    eventDate: "2026-10-03",
    tier: "Community partner",
    businessName: null,
    amount: 500,
    status: "open",
  },
  {
    id: "sb-6",
    eventName: "Winter Gala",
    eventDate: "2026-12-12",
    tier: "Presenting sponsor",
    businessName: "MLCC Partners LLC",
    amount: 3000,
    status: "filled",
  },
  {
    id: "sb-7",
    eventName: "Winter Gala",
    eventDate: "2026-12-12",
    tier: "Bronze",
    businessName: "Riverside Books",
    amount: 400,
    status: "open",
  },
];

type StatusFilter = "all" | SponsorshipSlotStatus;

const thClass =
  "px-4 py-3 text-left text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400";

function formatEventDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

function statusLabel(status: SponsorshipSlotStatus): string {
  switch (status) {
    case "open":
      return "Open";
    case "filled":
      return "Filled";
    case "paid":
      return "Paid";
  }
}

export default function SponsorshipTable() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const visibleRows = useMemo(() => {
    if (statusFilter === "all") return HARDCODED_EVENT_SPONSORSHIPS;
    return HARDCODED_EVENT_SPONSORSHIPS.filter((row) => row.status === statusFilter);
  }, [statusFilter]);

  return (
    <>
      <FilterPills<StatusFilter>
        aria-label="Sponsorship status"
        value={statusFilter}
        onChange={setStatusFilter}
        className="pt-4"
        pills={[
          { value: "all", label: "All" },
          { value: "open", label: "Open" },
          { value: "filled", label: "Filled" },
          { value: "paid", label: "Paid" },
        ]}
      />
      <div className="overflow-x-auto rounded-b-xl pt-4">
        <table className="min-w-full border-collapse border-t border-gray-100 dark:border-gray-800">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className={thClass}>Event</th>
              <th className={thClass}>Date</th>
              <th className={thClass}>Tier</th>
              <th className={thClass}>Business</th>
              <th className={thClass}>Amount</th>
              <th className={thClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  colSpan={6}
                >
                  No sponsorships match this filter.
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white/90">
                    {row.eventName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {formatEventDate(row.eventDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {row.tier}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {row.businessName ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-gray-900 dark:text-white/90">
                    {formatUsd(row.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                    <span className="capitalize">{statusLabel(row.status)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

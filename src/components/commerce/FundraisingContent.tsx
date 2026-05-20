"use client";

import { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FundraisingDonations } from "@/types/database";
import { getApiBase } from "@/lib/apiBase";

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

type Stats = {
  raisedCents: number;
  goalCents: number;
  count: number;
  percent: number;
};

export default function FundraisingContent() {
  const [items, setItems] = useState<FundraisingDonations[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${getApiBase()}/api/commerce/fundraising-donations`
        );
        const json = (await res.json()) as {
          items?: FundraisingDonations[];
          stats?: Stats;
          error?: string;
        };
        if (!res.ok) throw new Error(json.error ?? "Failed to load");
        if (!cancelled) {
          setItems(json.items ?? []);
          setStats(json.stats ?? null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="Fundraising" />
      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <ComponentCard title="Raised">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              {formatUsd(stats.raisedCents)}
            </p>
            <p className="text-sm text-gray-500">
              {stats.percent}% of {formatUsd(stats.goalCents)} goal
            </p>
          </ComponentCard>
          <ComponentCard title="Donations">
            <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              {stats.count}
            </p>
          </ComponentCard>
        </div>
      )}
      <ComponentCard title="Donations">
        {loading && <p className="text-sm text-gray-500">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-gray-500">No donations yet.</p>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Date</TableCell>
                  <TableCell isHeader>Tier</TableCell>
                  <TableCell isHeader>Email</TableCell>
                  <TableCell isHeader>Amount</TableCell>
                  <TableCell isHeader>Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{formatDate(row.created_at)}</TableCell>
                    <TableCell>{row.donation_tier}</TableCell>
                    <TableCell>{row.customer_email ?? "—"}</TableCell>
                    <TableCell>{formatUsd(row.amount_cents)}</TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ComponentCard>
    </>
  );
}

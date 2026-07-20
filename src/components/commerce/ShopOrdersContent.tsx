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
import type { ShopOrders } from "@/types/database";
import { getApiBase } from "@/lib/apiBase";
import { formatLineItemsSummary } from "@/lib/commerce/shopCart";

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function ShopOrdersContent() {
  const [items, setItems] = useState<ShopOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/commerce/shop-orders`);
        const json = (await res.json()) as {
          items?: ShopOrders[];
          error?: string;
        };
        if (!res.ok) throw new Error(json.error ?? "Failed to load");
        if (!cancelled) setItems(json.items ?? []);
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
    <div>
      <PageBreadcrumb pageTitle="Shop orders" />
      <ComponentCard title="Shop orders">
        {loading && <p className="text-sm text-gray-500">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-gray-500">No orders yet.</p>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Date</TableCell>
                  <TableCell isHeader>Name</TableCell>
                  <TableCell isHeader>Email</TableCell>
                  <TableCell isHeader>Items</TableCell>
                  <TableCell isHeader>Amount</TableCell>
                  <TableCell isHeader>Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{formatDate(row.created_at)}</TableCell>
                    <TableCell>{row.customer_name}</TableCell>
                    <TableCell>{row.customer_email}</TableCell>
                    <TableCell className="max-w-xs text-sm">
                      {formatLineItemsSummary(row.line_items)}
                    </TableCell>
                    <TableCell>{formatUsd(row.amount_cents)}</TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}

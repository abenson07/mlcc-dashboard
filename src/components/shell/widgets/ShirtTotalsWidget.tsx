"use client";

import { SHIRT_UNIT_CENTS, useShirtPreorderItems } from "@/hooks/useShirtPreorderItems";
import ShellWidget from "./ShellWidget";

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function ShirtTotalsWidget() {
  const { totalOrdered, totalRevenueCents, loading, error } = useShirtPreorderItems();

  return (
    <ShellWidget title="Totals" widgetId="shirt-totals">
      {loading && <p className="lf-meta">Loading…</p>}
      {error && <p className="lf-meta" style={{ color: "var(--lf-danger, #c00)" }}>{error}</p>}
      {!loading && !error && (
        <>
          <div className="shell-widget-headline-group">
            <div className="shell-widget-headline">{totalOrdered}</div>
            <div className="shell-widget-headline-sub">
              shirts ordered · {formatUsd(SHIRT_UNIT_CENTS)} each
            </div>
          </div>
          <div className="shell-widget-row">
            <span className="shell-widget-item-label">Revenue</span>
            <span className="shell-widget-item-value">{formatUsd(totalRevenueCents)}</span>
          </div>
        </>
      )}
    </ShellWidget>
  );
}

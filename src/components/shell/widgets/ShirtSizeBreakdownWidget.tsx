"use client";

import { useShirtPreorderItems } from "@/hooks/useShirtPreorderItems";
import ShellWidget from "./ShellWidget";

export default function ShirtSizeBreakdownWidget() {
  const { sizeCounts, loading, error } = useShirtPreorderItems();

  return (
    <ShellWidget title="Sizes ordered" widgetId="shirt-size-breakdown">
      {loading && <p className="lf-meta">Loading…</p>}
      {error && <p className="lf-meta" style={{ color: "var(--lf-danger, #c00)" }}>{error}</p>}
      {!loading && !error && sizeCounts.length === 0 && (
        <p className="lf-meta">No shirts ordered yet.</p>
      )}
      {!loading &&
        !error &&
        sizeCounts.map((row) => (
          <div key={row.size} className="shell-widget-row">
            <span className="shell-widget-item-label">{row.size}</span>
            <span className="shell-widget-item-value">{row.count}</span>
          </div>
        ))}
    </ShellWidget>
  );
}

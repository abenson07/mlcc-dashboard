import React from "react";

/** Two-column dashboard layout: primary ~2/3 width, stacked sidebar ~1/3 (from `lg`). */
export function WidgetMainSideLayout({
  main,
  side,
  className = "",
}: {
  main: React.ReactNode;
  side: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 lg:grid-cols-3 ${className}`.trim()}
    >
      <div className="min-w-0 lg:col-span-2">{main}</div>
      <div className="flex min-w-0 flex-col gap-4">{side}</div>
    </div>
  );
}

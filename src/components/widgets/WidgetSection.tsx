import React from "react";

export type WidgetColumnCount = 1 | 2 | 3;

const gridClass: Record<WidgetColumnCount, string> = {
  1: "grid grid-cols-1 gap-4",
  2: "grid grid-cols-1 gap-4 md:grid-cols-2",
  3: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
};

export function WidgetSection({
  columns,
  className = "",
  children,
}: {
  columns: WidgetColumnCount;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${gridClass[columns]} ${className}`.trim()}>{children}</div>
  );
}

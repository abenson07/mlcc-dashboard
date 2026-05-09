import React from "react";

export type StatMetricTone = "default" | "warning" | "neutral";

export type StatMetricCardsWidgetItem = {
  /** Large primary figure (e.g. count) */
  primary: string;
  label: string;
  /** Smaller line, often a currency total */
  secondary?: string;
  tone?: StatMetricTone;
};

const toneClass: Record<StatMetricTone, string> = {
  default: "text-mercury-ink dark:text-white/90",
  warning: "text-warning-600 dark:text-orange-400",
  neutral: "text-mercury-muted dark:text-white/45",
};

export function StatMetricCardsWidget({
  items,
  columns = 3,
}: {
  items: StatMetricCardsWidgetItem[];
  /** How many cards appear on one row at the widest breakpoint */
  columns?: 1 | 2 | 3;
}) {
  const grid =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-3";

  return (
    <div className={`grid gap-4 ${grid}`}>
      {items.map((item) => (
        <div
          key={`${item.label}-${item.primary}`}
          className="rounded-xl border border-mercury-line bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]"
        >
          <div
            className={`font-mercury-display text-mercury-display font-[520] tracking-tight ${toneClass[item.tone ?? "default"]}`}
          >
            {item.primary}
          </div>
          <div className="mt-2 text-mercury-small font-medium text-mercury-ink dark:text-white/80">
            {item.label}
          </div>
          {item.secondary ? (
            <div className="mt-2 text-mercury-caption text-mercury-muted dark:text-white/50">
              {item.secondary}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

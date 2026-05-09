import React from "react";
import Button from "@/components/ui/button/Button";

export type SegmentedOutstandingSegment = {
  key: string;
  label: string;
  /** CSS color (e.g. hex or tailwind arbitrary) */
  fill: string;
  flex: number;
};

export function SegmentedOutstandingCardWidget({
  title,
  amountLabel,
  actionLabel,
  onAction,
  subtitle,
  segments,
  legend,
  footer,
  className = "",
}: {
  title: string;
  amountLabel: string;
  actionLabel?: string;
  onAction?: () => void;
  subtitle?: string;
  segments: SegmentedOutstandingSegment[];
  legend: { key: string; text: string; dotColor: string }[];
  footer?: React.ReactNode;
  className?: string;
}) {
  const totalFlex = segments.reduce((a, s) => a + s.flex, 0) || 1;

  return (
    <div
      className={`overflow-hidden rounded-xl border border-mercury-line bg-white dark:border-white/10 dark:bg-white/[0.03] ${className}`.trim()}
    >
      <div className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="text-mercury-small font-medium text-mercury-muted dark:text-white/55">
              {title}
            </div>
            <div className="font-mercury-display text-mercury-h1 font-[520] tracking-tight text-mercury-ink dark:text-white/90">
              {amountLabel}
            </div>
            {subtitle ? (
              <p className="text-mercury-caption text-mercury-muted dark:text-white/50">
                {subtitle}
              </p>
            ) : null}
          </div>
          {actionLabel ? (
            <Button type="button" variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
        </div>

        <div
          className="mt-6 flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10"
          role="img"
          aria-label="Balance segments"
        >
          {segments.map((s) => (
            <div
              key={s.key}
              style={{
                flexGrow: s.flex,
                flexBasis: `${(100 * s.flex) / totalFlex}%`,
                backgroundColor: s.fill,
              }}
            />
          ))}
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-mercury-caption text-mercury-muted dark:text-white/55">
          {legend.map((row) => (
            <li key={row.key} className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: row.dotColor }}
              />
              {row.text}
            </li>
          ))}
        </ul>
      </div>

      {footer ? (
        <div className="border-t border-mercury-line bg-gray-50 px-5 py-4 dark:border-white/10 dark:bg-white/[0.04]">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

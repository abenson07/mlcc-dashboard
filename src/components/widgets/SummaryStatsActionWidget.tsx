import React from "react";
import Button from "@/components/ui/button/Button";

export type SummaryStatItem = {
  label: string;
  value: string;
  valueClassName?: string;
};

export function SummaryStatsActionWidget({
  stats,
  actionLabel,
  onAction,
  actionEndIcon,
  className = "",
}: {
  stats: SummaryStatItem[];
  actionLabel?: string;
  onAction?: () => void;
  actionEndIcon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-5 rounded-xl border border-mercury-line bg-white p-5 lg:flex-row lg:items-center lg:gap-8 dark:border-white/10 dark:bg-white/[0.03] ${className}`.trim()}
    >
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0">
            <div className="text-mercury-caption text-mercury-muted dark:text-white/50">
              {s.label}
            </div>
            <div
              className={`mt-1 text-mercury-body-lg font-[520] text-mercury-ink dark:text-white/90 ${s.valueClassName ?? ""}`.trim()}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {actionLabel ? (
        <>
          <div
            className="hidden h-12 w-px shrink-0 bg-mercury-line lg:block dark:bg-white/10"
            aria-hidden
          />
          <div className="flex shrink-0 justify-end lg:items-center">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={onAction}
              endIcon={actionEndIcon}
              className="rounded-full"
            >
              {actionLabel}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

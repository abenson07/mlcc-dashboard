import React from "react";
import Badge from "@/components/ui/badge/Badge";
import { DownloadIcon, InfoIcon, PencilIcon } from "@/icons";
import { CurrencySuperscriptSecondary } from "./currency";

export function LoanRepaymentSummaryWidget({
  title,
  badge,
  amount,
  repaymentLabel,
  repaidFraction,
  repaidLegend,
  outstandingLegend,
  actions,
  className = "",
}: {
  title: string;
  badge?: string;
  amount: string;
  repaymentLabel?: string;
  /** 0–1 portion repaid */
  repaidFraction: number;
  repaidLegend: string;
  outstandingLegend: string;
  actions: { key: string; label: string; icon: "edit" | "download"; href?: string }[];
  className?: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, repaidFraction)) * 100);

  return (
    <div
      className={`rounded-xl border border-mercury-line bg-white dark:border-white/10 dark:bg-white/[0.03] ${className}`.trim()}
    >
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-mercury-small font-medium text-mercury-muted dark:text-white/55">
            <span>{title}</span>
            <button
              type="button"
              aria-label={`About ${title}`}
              className="rounded-full p-0.5 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <InfoIcon className="size-4" />
            </button>
          </div>
          {badge ? (
            <Badge variant="light" color="info" size="sm">
              {badge}
            </Badge>
          ) : null}
        </div>

        <div className="mt-2 font-mercury-display text-mercury-display font-[520] tracking-tight text-mercury-ink dark:text-white/90">
          <CurrencySuperscriptSecondary value={amount} />
        </div>

        <div className="mt-6">
          <div className="text-mercury-caption text-mercury-muted dark:text-white/50">
            {repaymentLabel ?? "Repayment progress"}
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-brand-500 transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-mercury-caption text-mercury-muted dark:text-white/55">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand-500" />
              {repaidLegend}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-light-100 dark:bg-blue-light-500/30" />
              {outstandingLegend}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 border-t border-mercury-line px-5 py-4 dark:border-white/10">
        {actions.map((a) => {
          const icon =
            a.icon === "edit" ? (
              <PencilIcon className="size-4" />
            ) : (
              <DownloadIcon className="size-4" />
            );
          const inner = (
            <>
              <span className="text-mercury-muted dark:text-white/55">
                {icon}
              </span>
              {a.label}
            </>
          );
          return a.href ? (
            <a
              key={a.key}
              href={a.href}
              className="inline-flex items-center gap-2 text-mercury-caption font-medium text-mercury-ink hover:text-brand-600 dark:text-white/80 dark:hover:text-brand-400"
            >
              {inner}
            </a>
          ) : (
            <button
              key={a.key}
              type="button"
              className="inline-flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-mercury-caption font-medium text-mercury-ink hover:text-brand-600 dark:text-white/80 dark:hover:text-brand-400"
            >
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}

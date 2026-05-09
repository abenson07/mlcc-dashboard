import React from "react";
import { InfoIcon } from "@/icons";
import { CurrencySuperscriptSecondary } from "./currency";

function VerifiedBadge() {
  return (
    <span
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-light-100 text-blue-light-600 dark:bg-blue-light-500/20 dark:text-blue-light-400"
      title="Verified"
      aria-label="Verified"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M12 3l7 4v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V7l7-4z" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export type FundsAvailabilitySecondary = {
  label: string;
  value: string;
  superscriptCents?: boolean;
};

export function FundsAvailabilityBannerWidget({
  primaryLabel,
  primaryValue,
  showInfo,
  verified,
  secondaries = [],
  className = "",
}: {
  primaryLabel: string;
  primaryValue: string;
  showInfo?: boolean;
  verified?: boolean;
  secondaries?: FundsAvailabilitySecondary[];
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-6 rounded-xl border border-mercury-line bg-white p-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10 dark:border-white/10 dark:bg-white/[0.03] ${className}`.trim()}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-mercury-caption text-mercury-muted dark:text-white/55">
          <span>{primaryLabel}</span>
          {showInfo ? (
            <button
              type="button"
              aria-label={`About ${primaryLabel}`}
              className="rounded-full p-0.5 text-mercury-muted hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <InfoIcon className="size-4" />
            </button>
          ) : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="font-mercury-display text-mercury-h1 font-[520] tracking-tight text-mercury-ink dark:text-white/90">
            {primaryValue}
          </span>
          {verified ? <VerifiedBadge /> : null}
        </div>
      </div>

      {secondaries.length > 0 ? (
        <div className="flex flex-1 flex-wrap gap-8 lg:justify-end">
          {secondaries.map((s) => (
            <div key={s.label} className="min-w-[7rem]">
              <div className="text-mercury-caption text-mercury-muted dark:text-white/55">
                {s.label}
              </div>
              <div className="mt-1 text-mercury-body font-[450] text-mercury-muted dark:text-white/65">
                {s.superscriptCents ?? true ? (
                  <CurrencySuperscriptSecondary value={s.value} />
                ) : (
                  s.value
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

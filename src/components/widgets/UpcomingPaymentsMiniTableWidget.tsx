import React from "react";
import { CurrencySuperscriptSecondary } from "./currency";

export type UpcomingPaymentRow = {
  id: string;
  date: string;
  payment: string;
  endingBalance: string;
};

export function UpcomingPaymentsMiniTableWidget({
  title,
  headerLinkLabel,
  headerLinkHref,
  columns,
  rows,
  className = "",
}: {
  title: string;
  headerLinkLabel?: string;
  headerLinkHref?: string;
  columns: { date: string; payment: string; endingBalance: string };
  rows: UpcomingPaymentRow[];
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-mercury-line bg-white dark:border-white/10 dark:bg-white/[0.03] ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-4 rounded-t-xl bg-gray-50 px-5 py-3 dark:bg-white/[0.06]">
        <span className="text-mercury-small font-semibold text-mercury-ink dark:text-white/90">
          {title}
        </span>
        {headerLinkLabel ? (
          <a
            href={headerLinkHref ?? "#"}
            className="text-mercury-caption font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            {headerLinkLabel}
          </a>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] text-left text-mercury-caption">
          <thead>
            <tr className="border-b border-mercury-line text-mercury-muted dark:border-white/10 dark:text-white/50">
              <th className="px-5 py-3 font-medium">{columns.date}</th>
              <th className="px-5 py-3 font-medium">{columns.payment}</th>
              <th className="px-5 py-3 text-right font-medium">
                {columns.endingBalance}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-mercury-line last:border-0 dark:border-white/10"
              >
                <td className="px-5 py-3 text-mercury-ink dark:text-white/85">
                  {r.date}
                </td>
                <td className="px-5 py-3 text-mercury-ink dark:text-white/85">
                  <CurrencySuperscriptSecondary value={r.payment} />
                </td>
                <td className="px-5 py-3 text-right text-mercury-ink dark:text-white/85">
                  <CurrencySuperscriptSecondary value={r.endingBalance} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

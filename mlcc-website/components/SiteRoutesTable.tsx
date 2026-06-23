"use client";

import * as React from "react";
import Link from "next/link";
import {
  ROUTE_STATUSES,
  type RouteStatus,
  type RouteTrack,
} from "@marketing/data/site-routes";

const STATUS_LABELS: Record<RouteStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  review: "Review",
  complete: "Complete",
};

const STATUS_STYLES: Record<RouteStatus, string> = {
  "not-started": "bg-sparkles-warm text-sparkles-muted",
  "in-progress": "bg-sparkles-blue/30 text-sparkles-navy",
  review: "bg-sparkles-gold/35 text-sparkles-navy",
  complete: "bg-sparkles-accent/20 text-sparkles-accent",
};

function nextStatus(current: RouteStatus): RouteStatus {
  const index = ROUTE_STATUSES.indexOf(current);
  return ROUTE_STATUSES[(index + 1) % ROUTE_STATUSES.length];
}

type StatusField = "layout" | "content" | "polish";

function StatusToggle({
  value,
  onChange,
  label,
}: {
  value: RouteStatus;
  onChange: (next: RouteStatus) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(nextStatus(value))}
      className={`inline-flex min-w-[7.5rem] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors duration-200 hover:opacity-85 ${STATUS_STYLES[value]}`}
      aria-label={`${label}: ${STATUS_LABELS[value]}. Click to change.`}
    >
      {STATUS_LABELS[value]}
    </button>
  );
}

export function SiteRoutesTable({ routes }: { routes: RouteTrack[] }) {
  const [rows, setRows] = React.useState(routes);

  const updateStatus = (path: string, field: StatusField, value: RouteStatus) => {
    setRows((current) =>
      current.map((row) => (row.path === path ? { ...row, [field]: value } : row)),
    );
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-sparkles-navy-8 bg-white/60">
      <table className="w-full min-w-[52rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-sparkles-navy-8">
            <th className="px-6 py-4 font-display text-sm font-bold uppercase tracking-wide text-puget-night">
              Page
            </th>
            <th className="px-6 py-4 font-display text-sm font-bold uppercase tracking-wide text-puget-night">
              Layout
            </th>
            <th className="px-6 py-4 font-display text-sm font-bold uppercase tracking-wide text-puget-night">
              Content
            </th>
            <th className="px-6 py-4 font-display text-sm font-bold uppercase tracking-wide text-puget-night">
              Polish
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.path} className="border-b border-sparkles-navy-8 last:border-b-0">
              <td className="px-6 py-4">
                <Link
                  href={row.path}
                  className="font-body text-base font-semibold text-sparkles-navy underline-offset-4 hover:underline"
                >
                  {row.label}
                </Link>
                <div className="mt-1 font-body text-sm text-sparkles-muted">{row.path}</div>
              </td>
              <td className="px-6 py-4">
                <StatusToggle
                  value={row.layout}
                  label={`${row.label} layout`}
                  onChange={(value) => updateStatus(row.path, "layout", value)}
                />
              </td>
              <td className="px-6 py-4">
                <StatusToggle
                  value={row.content}
                  label={`${row.label} content`}
                  onChange={(value) => updateStatus(row.path, "content", value)}
                />
              </td>
              <td className="px-6 py-4">
                <StatusToggle
                  value={row.polish}
                  label={`${row.label} polish`}
                  onChange={(value) => updateStatus(row.path, "polish", value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

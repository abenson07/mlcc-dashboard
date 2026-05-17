"use client";

import React, { ReactNode } from "react";
import { toast } from "sonner";
import Badge from "@/components/ui/badge/Badge";

export const mercuryHeaderCell =
  "border-b border-gray-200 px-3 py-2.5 text-left text-xs font-medium text-gray-500 dark:border-white/[0.05] dark:text-gray-400";

/** Max visible characters for business name in businesses table columns. */
export const BUSINESS_TABLE_NAME_MAX_CHARS = 40;

export const businessTableNameCellClass = "max-w-[40ch] w-[40ch]";

export function truncateDisplayText(text: string, maxLen = BUSINESS_TABLE_NAME_MAX_CHARS): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`;
}

export function SidebarDivider() {
  return <hr className="my-4 border-gray-100 dark:border-white/[0.08]" />;
}

export function SidebarSectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{children}</p>
  );
}

export function SidebarField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 first:pt-0">
      <span className="text-theme-xs text-gray-500 dark:text-gray-400">{label}</span>
      <div className="text-theme-sm font-medium text-gray-900 dark:text-white/90">{children}</div>
    </div>
  );
}

export function SidebarMutedLine({ children }: { children: ReactNode }) {
  return <div className="text-theme-xs text-gray-500 dark:text-gray-400">{children}</div>;
}

export function CopyableMuted({ value, label }: { value: string; label?: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(label ? `${label} copied` : "Copied");
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        void copy();
      }}
      className="w-full rounded text-left font-mono text-theme-xs text-gray-500 underline-offset-2 hover:underline dark:text-gray-400"
    >
      {value}
    </button>
  );
}

/** Name primary; email on hover. Parent `<td>` should include `group/name`. */
export function NameEmailHoverCell({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0">
      <span className="truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">{name}</span>
      <span className="max-h-0 overflow-hidden text-theme-xs text-gray-500 opacity-0 transition-[max-height,opacity,margin] duration-150 group-hover/name:max-h-6 group-hover/name:opacity-100 dark:text-gray-400">
        {email}
      </span>
    </div>
  );
}

/**
 * Neighbors-all mercury table: name (and optional phone when condensed); address on hover.
 * Parent `<td>` should include `group/name`.
 */
export function NeighborNameAddressHoverCell({
  name,
  address,
  phoneCondensed,
}: {
  name: string;
  address: string;
  phoneCondensed?: string;
}) {
  const addrTrim = address.trim();
  const phoneTrim = phoneCondensed?.trim() ?? "";
  const hoverLineClass =
    "max-h-0 overflow-hidden text-theme-xs text-gray-500 opacity-0 transition-[max-height,opacity] duration-150 group-hover/name:max-h-24 group-hover/name:opacity-100 dark:text-gray-400";

  const addressHover =
    addrTrim.length > 0 ? <span className={hoverLineClass}>{addrTrim}</span> : null;

  if (phoneCondensed !== undefined) {
    return (
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">{name}</div>
        {phoneTrim.length > 0 ? (
          <div className="truncate text-theme-xs text-gray-500 dark:text-gray-400">{phoneTrim}</div>
        ) : null}
        {addressHover}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-0">
      <span className="truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">{name}</span>
      {addressHover}
    </div>
  );
}

/** Contact: email + phone on hover. Parent `<td>` must include `group/contact`. */
export function ContactEmailPhoneHover({
  email,
  phone,
}: {
  email: string;
  phone: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0">
      <span className="truncate text-theme-sm text-gray-800 dark:text-white/90">{email}</span>
      <span className="max-h-0 overflow-hidden text-theme-xs text-gray-500 opacity-0 transition-[max-height,opacity] duration-150 group-hover/contact:max-h-6 group-hover/contact:opacity-100 dark:text-gray-400">
        {phone}
      </span>
    </div>
  );
}

function BusinessStatusIconTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="group/icon relative inline-flex size-[1em] items-center justify-center">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 whitespace-nowrap rounded border border-gray-200 bg-gray-900 px-1.5 py-0.5 text-[10px] font-medium leading-none text-white opacity-0 shadow-sm transition-opacity duration-100 group-hover/icon:opacity-100 dark:border-gray-700 dark:bg-gray-800"
      >
        {label}
      </span>
    </span>
  );
}

/** Business name + status icons; address on hover. Parent `<td>` must include `group/business`. */
export function BusinessNameWithStatusIcons({
  business_name,
  address,
  is_member,
  is_past_sponsor,
  memberIcon,
  pastSponsorIcon,
}: {
  business_name: string;
  address: string;
  is_member: boolean;
  is_past_sponsor: boolean;
  memberIcon: React.ReactNode;
  pastSponsorIcon: React.ReactNode;
}) {
  const addrTrim = address.trim();
  const hoverLineClass =
    "max-h-0 overflow-hidden text-theme-xs text-gray-500 opacity-0 transition-[max-height,opacity] duration-150 group-hover/business:max-h-24 group-hover/business:opacity-100 dark:text-gray-400";

  return (
    <div className="flex min-w-0 flex-col gap-0">
      <div className="inline-flex max-w-full min-w-0 items-center gap-1.5">
        <span
          className="min-w-0 shrink truncate text-theme-sm font-medium leading-5 text-gray-800 dark:text-white/90"
          title={business_name}
        >
          {truncateDisplayText(business_name)}
        </span>
        {is_member || is_past_sponsor ? (
          <span className="inline-flex shrink-0 items-center gap-0.5 text-theme-sm leading-none text-gray-500 dark:text-gray-400">
            {is_past_sponsor ? (
              <BusinessStatusIconTooltip label="Past sponsor">{pastSponsorIcon}</BusinessStatusIconTooltip>
            ) : null}
            {is_member ? (
              <BusinessStatusIconTooltip label="Member">{memberIcon}</BusinessStatusIconTooltip>
            ) : null}
          </span>
        ) : null}
      </div>
      {addrTrim.length > 0 ? <span className={hoverLineClass}>{addrTrim}</span> : null}
    </div>
  );
}

/** Deliverer name; email on hover. Parent `<td>` must include `group/deliverer`. */
export function DelivererHoverCell({ name, email }: { name: string; email: string | null }) {
  const secondary = email?.trim() || "—";
  return (
    <div className="flex min-w-0 flex-col gap-0">
      <span className="truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">{name}</span>
      <span className="max-h-0 overflow-hidden text-theme-xs text-gray-500 opacity-0 transition-[max-height,opacity] duration-150 group-hover/deliverer:max-h-6 group-hover/deliverer:opacity-100 dark:text-gray-400">
        {secondary}
      </span>
    </div>
  );
}

/** Invoice number; created date on hover. Parent `<td>` must include `group/invmeta`. */
export function InvoiceNumberCreatedHover({ number, created }: { number: string; created: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0">
      <span className="truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">{number}</span>
      <span className="max-h-0 overflow-hidden text-theme-xs text-gray-500 opacity-0 transition-[max-height,opacity] duration-150 group-hover/invmeta:max-h-6 group-hover/invmeta:opacity-100 dark:text-gray-400">
        {created}
      </span>
    </div>
  );
}

/** Status badge + renewal line on hover. Parent `<td>` must include `group/memstat`. */
export function MembershipStatusRenewalHover({
  statusLabel,
  renewalShort,
  color,
}: {
  statusLabel: string;
  renewalShort: string;
  color: "success" | "warning" | "light" | "info";
}) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-0.5">
      <Badge variant="light" color={color} size="sm">
        {statusLabel}
      </Badge>
      <span className="max-h-0 overflow-hidden text-theme-xs text-gray-500 opacity-0 transition-[max-height,opacity] duration-150 group-hover/memstat:max-h-8 group-hover/memstat:opacity-100 dark:text-gray-400">
        Renewed {renewalShort}
      </span>
    </div>
  );
}

/** Coverage status as tag + deliverer names on hover. Parent `<td>` must include `group/coverage`. */
export function CoverageDeliverersHover({
  label,
  deliverers,
  color,
}: {
  label: string;
  deliverers: string[];
  color: "success" | "warning" | "light" | "info";
}) {
  const detail = deliverers.length ? deliverers.join(", ") : "No deliverers assigned";
  return (
    <div className="relative min-w-0">
      <div className="flex min-w-0 max-w-full items-start">
        <Badge variant="light" color={color} size="sm">
          {label}
        </Badge>
      </div>
      <div className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden max-w-xs rounded-md border border-gray-200 bg-white px-2 py-1.5 text-theme-xs text-gray-600 shadow-md group-hover/coverage:block dark:border-white/[0.08] dark:bg-gray-900 dark:text-gray-300">
        {detail}
      </div>
    </div>
  );
}

/** Summary number with breakdown on hover. Parent `<td>` must include `group/countbd`. */
export function CountBreakdownHover({
  summary,
  lines,
}: {
  summary: ReactNode;
  lines: string[];
}) {
  return (
    <div className="relative min-w-0">
      <div className="text-theme-sm font-medium text-gray-800 dark:text-white/90">{summary}</div>
      <div className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden min-w-[140px] rounded-md border border-gray-200 bg-white px-2 py-1.5 text-theme-xs text-gray-600 shadow-md group-hover/countbd:block dark:border-white/[0.08] dark:bg-gray-900 dark:text-gray-300">
        <ul className="list-inside list-disc space-y-0.5">
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TruncatedTagPills({ tags, max = 3 }: { tags: string[]; max?: number }) {
  const shown = tags.slice(0, max);
  const extra = tags.length - shown.length;
  return (
    <div className="flex min-w-0 flex-wrap gap-1">
      {shown.map((t) => (
        <Badge key={t} variant="light" color="light" size="sm">
          {t}
        </Badge>
      ))}
      {extra > 0 && (
        <Badge variant="light" color="light" size="sm">
          +{extra}
        </Badge>
      )}
    </div>
  );
}

export function membershipBadgeColor(status: string | null): "success" | "warning" | "light" | "info" {
  const s = (status ?? "").toLowerCase();
  if (s.includes("active")) return "success";
  if (s.includes("past") || s.includes("lapse")) return "warning";
  if (!status) return "light";
  return "info";
}

export function invoiceStatusColor(
  status: string,
): "success" | "warning" | "error" | "info" | "light" {
  const s = status.toLowerCase();
  if (s === "paid") return "success";
  if (s === "open") return "warning";
  if (s === "uncollectible" || s === "void") return "error";
  if (s === "draft") return "light";
  return "info";
}

export function splitCurrency(amount: number): { dollars: string; cents: string } {
  const neg = amount < 0;
  const abs = Math.abs(amount);
  const [intPart, frac] = abs.toFixed(2).split(".");
  const dollars = `${neg ? "-" : ""}$${Number(intPart).toLocaleString()}`;
  return { dollars, cents: frac ?? "00" };
}

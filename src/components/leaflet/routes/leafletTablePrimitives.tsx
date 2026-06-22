"use client";

import { useEffect, type ReactNode } from "react";
import { IconChevronDown, IconClose, IconDownload, IconPlus } from "./leafletIcons";

export function LeafletPageHeader({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-[22px] font-semibold leading-tight text-[#18181B]">{title}</h1>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function LeafletPageDescription({ children }: { children: ReactNode }) {
  return <p className="text-[13px] text-[#71717A]">{children}</p>;
}

export function LeafletExportButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#18181B] transition-colors hover:bg-zinc-50"
    >
      <IconDownload />
      Export
    </button>
  );
}

export function LeafletOutlineButton({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#18181B] transition-colors hover:bg-zinc-50"
    >
      <IconPlus />
      {children}
    </button>
  );
}

export function LeafletSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative flex w-[220px] items-center gap-2 rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1.5">
      <svg
        className="shrink-0 text-[#A1A1AA]"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
        <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-0"
      />
    </label>
  );
}

export function LeafletFilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-md border border-[#E5E5E5] bg-white py-1.5 pl-2.5 pr-8 text-[13px] text-[#71717A] focus:border-zinc-300 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value || "__all"} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#71717A]"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export type LeafletTableColumn<T> = {
  id: string;
  header: string;
  flex?: number;
  align?: "start" | "end";
  cell: (row: T) => ReactNode;
};

export function LeafletDataTable<T extends { id: string }>({
  rows,
  columns,
  selectedId,
  onSelect,
  emptyMessage,
  headerPaddingClass = "pl-7",
}: {
  rows: T[];
  columns: LeafletTableColumn<T>[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  emptyMessage: string;
  headerPaddingClass?: string;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className={`flex min-w-[520px] items-center py-2 pr-1 ${headerPaddingClass}`}>
        <div className="w-6 shrink-0" aria-hidden />
        {columns.map((col) => (
          <div
            key={col.id}
            className={`min-w-0 flex-1 px-1 text-xs text-[#A1A1AA] ${
              col.align === "end" ? "text-right" : "text-left"
            }`}
            style={col.flex ? { flex: col.flex } : undefined}
          >
            {col.header}
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-[#71717A]">{emptyMessage}</p>
      ) : (
        rows.map((row) => {
          const selected = row.id === selectedId;
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => onSelect(row.id)}
              className={`flex w-full min-w-[520px] items-center rounded-md py-2 pr-1 text-left transition-colors hover:bg-zinc-100/80 ${headerPaddingClass} ${
                selected ? "bg-[#EBEBEC]" : ""
              }`}
            >
              <div className="w-6 shrink-0" aria-hidden />
              {columns.map((col) => (
                <div
                  key={col.id}
                  className={`min-w-0 flex-1 px-1 text-[13px] ${
                    col.align === "end" ? "text-right" : "text-left"
                  }`}
                  style={col.flex ? { flex: col.flex } : undefined}
                >
                  {col.cell(row)}
                </div>
              ))}
            </button>
          );
        })
      )}
    </div>
  );
}

export function LeafletMasterDetailLayout({
  detailOpen,
  onCloseDetail,
  detailTitle,
  detailWidth = 300,
  panelHeader = "title-close",
  children,
  detail,
}: {
  detailOpen: boolean;
  onCloseDetail: () => void;
  detailTitle: string;
  detailWidth?: 300 | 320;
  /** Routes: close-only. Open routes / substitutions: title + close. */
  panelHeader?: "none" | "close-only" | "title-close";
  children: ReactNode;
  detail: ReactNode;
}) {
  useEffect(() => {
    if (!detailOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseDetail();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [detailOpen, onCloseDetail]);

  return (
    <div className={`flex min-h-0 items-stretch ${detailOpen ? "gap-6" : ""}`}>
      <div className={`min-w-0 flex-1 ${detailOpen ? "pr-5" : ""}`}>{children}</div>
      {detailOpen ? (
        <aside
          className="flex max-h-[calc(100vh-10rem)] min-h-0 shrink-0 flex-col gap-3 overflow-y-auto"
          style={{ width: detailWidth }}
          aria-label={detailTitle}
        >
          {panelHeader !== "none" && (
            <div
              className={`flex items-center gap-2 pb-1 ${
                panelHeader === "close-only" ? "justify-end" : "justify-between"
              }`}
            >
              {panelHeader === "title-close" ? (
                <h2 className="min-w-0 truncate text-sm font-semibold text-[#18181B]">
                  {detailTitle}
                </h2>
              ) : null}
              <button
                type="button"
                onClick={onCloseDetail}
                className="inline-flex shrink-0 rounded p-0.5 text-[#A1A1AA] transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                aria-label="Close details"
              >
                <IconClose />
              </button>
            </div>
          )}
          {detail}
        </aside>
      ) : null}
    </div>
  );
}

export function LeafletDetailCard({
  title,
  children,
  headerRight,
  showChevron = true,
}: {
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
  showChevron?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-white">
      <header className="flex items-center justify-between gap-2 border-b border-[#E5E5E5] px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <h3 className="text-[13px] font-semibold text-[#18181B]">{title}</h3>
          {showChevron ? <IconChevronDown /> : null}
        </div>
        {headerRight}
      </header>
      <div className="px-3 pb-3 pt-1">{children}</div>
    </section>
  );
}

export function LeafletDetailRow({
  label,
  value,
  valueClassName = "text-[#18181B] font-medium",
  icon,
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-[13px]">
      <span className="text-[#71717A]">{label}</span>
      <span className={`inline-flex items-center gap-1.5 text-right ${valueClassName}`}>
        {icon}
        {value}
      </span>
    </div>
  );
}

export function LeafletDetailSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="pb-1 text-[11px] font-semibold uppercase tracking-wide text-[#A1A1AA]">
      {children}
    </p>
  );
}

export function LeafletDetailDivider() {
  return <div className="my-2 h-px w-full bg-[#F3F3F4]" />;
}

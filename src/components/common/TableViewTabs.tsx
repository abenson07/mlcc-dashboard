"use client";

import React from "react";

export type TableViewTabItem<T extends string = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export type TableViewTabsProps<T extends string> = {
  tabs: TableViewTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
  /** Renders on the right of the tab row (e.g. primary action). */
  endSlot?: React.ReactNode;
};

/**
 * Underlined tab row for switching table views (content sits directly below).
 */
export default function TableViewTabs<T extends string>({
  tabs,
  value,
  onChange,
  className = "",
  "aria-label": ariaLabel = "Table view",
  endSlot,
}: TableViewTabsProps<T>) {
  return (
    <div className={`border-b border-mercury-line dark:border-white/10 ${className}`}>
      <div
        className="-mb-px flex flex-wrap items-end justify-between gap-4"
        role="tablist"
        aria-label={ariaLabel}
      >
        <div className="flex flex-wrap gap-6">
          {tabs.map((tab) => {
            const selected = tab.value === value;
            const disabled = tab.disabled ?? false;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-disabled={disabled}
                disabled={disabled}
                onClick={() => !disabled && onChange(tab.value)}
                className={`relative border-none bg-transparent px-0 pb-3 text-mercury-body font-medium transition-colors outline-offset-2 ${
                  selected
                    ? "text-mercury-ink dark:text-white"
                    : "text-mercury-muted hover:text-mercury-ink dark:hover:text-white/80"
                } ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
              >
                {tab.label}
                {selected ? (
                  <span
                    className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-blue-light-600 dark:bg-blue-light-400"
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </div>
        {endSlot ? <div className="shrink-0 pb-3">{endSlot}</div> : null}
      </div>
    </div>
  );
}
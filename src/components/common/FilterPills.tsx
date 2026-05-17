"use client";

import React from "react";

export type FilterPillItem<T extends string = string> = {
  value: T;
  label: string;
};

export type FilterPillsProps<T extends string> = {
  pills: FilterPillItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
};

export default function FilterPills<T extends string>({
  pills,
  value,
  onChange,
  className = "",
  "aria-label": ariaLabel = "Filters",
}: FilterPillsProps<T>) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      {pills.map((pill) => {
        const selected = pill.value === value;
        return (
          <button
            key={pill.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(pill.value)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              selected
                ? "border-transparent bg-violet-100 text-gray-900 dark:bg-blue-light-500/25 dark:text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            }`}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}


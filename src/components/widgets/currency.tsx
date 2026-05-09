import React from "react";

/** Splits "$1,234.56" → main "$1,234", cents ".56" */
export function splitCurrencyParts(formatted: string): {
  main: string;
  cents: string | null;
} {
  const trimmed = formatted.trim();
  const idx = trimmed.lastIndexOf(".");
  if (idx === -1) return { main: trimmed, cents: null };
  return {
    main: trimmed.slice(0, idx),
    cents: trimmed.slice(idx),
  };
}

/** Large currency stays uniform; secondary amounts use superscript cents (Mercury-style). */
export function CurrencySuperscriptSecondary({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const { main, cents } = splitCurrencyParts(value);
  return (
    <span
      className={`inline-flex items-baseline gap-0 font-[450] text-inherit ${className}`.trim()}
    >
      <span className="leading-none">{main}</span>
      {cents ? (
        <span className="text-[0.72em] font-[450] leading-none">
          {cents}
        </span>
      ) : null}
    </span>
  );
}

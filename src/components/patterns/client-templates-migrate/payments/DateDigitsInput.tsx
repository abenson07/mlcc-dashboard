"use client";

import { forwardRef } from "react";
import { fieldInputStyle } from "./checkEntryStyles";

/** `YYYY-MM-DD` ↔ the `MM/DD/YYYY` text the keypad-friendly input shows. */
export function isoToDigits(iso: string): string {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${m}${d}${y}` : "";
}

export function digitsToIso(digits: string): string | null {
  if (digits.length !== 8) return null;
  const m = Number(digits.slice(0, 2));
  const d = Number(digits.slice(2, 4));
  const y = Number(digits.slice(4));
  const date = new Date(Date.UTC(y, m - 1, d));
  if (y < 2000 || date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return `${digits.slice(4)}-${digits.slice(0, 2)}-${digits.slice(2, 4)}`;
}

export function formatDigits(digits: string): string {
  const a = digits.slice(0, 2);
  const b = digits.slice(2, 4);
  const c = digits.slice(4, 8);
  return [a, b, c].filter((part, i) => part || i === 0).join("/");
}

export function todayDigits(): string {
  const n = new Date();
  return `${String(n.getMonth() + 1).padStart(2, "0")}${String(n.getDate()).padStart(2, "0")}${n.getFullYear()}`;
}

type Props = {
  digits: string;
  onChange: (digits: string) => void;
  invalid?: boolean;
};

/** Type 10012026 with the number pad → 10/01/2026. Selecting on focus lets you overwrite the default. */
export const DateDigitsInput = forwardRef<HTMLInputElement, Props>(function DateDigitsInput(
  { digits, onChange, invalid },
  ref,
) {
  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      aria-label="Check date"
      aria-invalid={invalid || undefined}
      placeholder="MM/DD/YYYY"
      value={formatDigits(digits)}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => {
        const next = e.target.value.replace(/\D/g, "").slice(0, 8);
        // Backspacing over a "/" leaves the digits unchanged; drop one so deletion never sticks.
        if (e.target.value.length < formatDigits(digits).length && next === digits) {
          onChange(digits.slice(0, -1));
        } else {
          onChange(next);
        }
      }}
      style={{
        ...fieldInputStyle,
        ...(invalid ? { borderColor: "#e5484d" } : null),
      }}
    />
  );
});

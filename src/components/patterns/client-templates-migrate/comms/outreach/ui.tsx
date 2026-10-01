"use client";

import type { CSSProperties, ReactNode } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/patterns/primitives/Button";

export const hairline = "var(--linear-border-width) solid var(--linear-color-hairline)";

export const fieldStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  borderRadius: 6,
  border: hairline,
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 510, color: "var(--linear-color-ink)", marginBottom: 8 }}>
      {children}
    </div>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{children}</div>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div role="alert" style={{ fontSize: 12, color: "#e5484d", marginTop: 8 }}>
      {children}
    </div>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 6,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  ariaLabel: string;
}) {
  return (
    <textarea
      aria-label={ariaLabel}
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...fieldStyle, padding: 10, lineHeight: "20px", resize: "vertical" }}
    />
  );
}

export function TextField({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel: string;
}) {
  return (
    <input
      aria-label={ariaLabel}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...fieldStyle, height: 32, paddingInline: 10 }}
    />
  );
}

/** Pill with a checkbox, used for multi-select (platforms, channels). */
export function ChipToggle({
  label,
  checked,
  onChange,
  disabled,
  title,
}: {
  label: string;
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      title={title}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      style={{
        all: "unset",
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        height: 36,
        paddingInline: 14,
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 510,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        color: "var(--linear-color-ink)",
        border: checked ? "var(--linear-border-width) solid var(--linear-color-accent)" : hairline,
        background: checked ? "var(--linear-color-sidebar-item-selected)" : "var(--linear-color-canvas)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: checked ? "var(--linear-color-accent)" : "transparent",
          border: checked ? "none" : hairline,
          color: "#fff",
        }}
      >
        {checked ? <Check size={11} strokeWidth={3} /> : null}
      </span>
      {label}
    </button>
  );
}

/** Single-select pill (audience, intensity). */
export function ChoicePill({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      style={{
        all: "unset",
        boxSizing: "border-box",
        height: 32,
        paddingInline: 14,
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 16,
        fontSize: 13,
        cursor: "pointer",
        color: "var(--linear-color-ink)",
        border: selected ? "var(--linear-border-width) solid var(--linear-color-accent)" : hairline,
        background: selected ? "var(--linear-color-sidebar-item-selected)" : "var(--linear-color-canvas)",
      }}
    >
      {label}
    </button>
  );
}

/** Card with a radio dot; the whole card selects. */
export function RadioCard({
  selected,
  onSelect,
  children,
  ariaLabel,
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      aria-label={ariaLabel}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 10,
        cursor: "pointer",
        border: selected ? "var(--linear-border-width) solid var(--linear-color-accent)" : hairline,
        background: selected ? "var(--linear-color-sidebar-item-selected)" : "var(--linear-color-canvas)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          flexShrink: 0,
          border: selected ? "5px solid var(--linear-color-accent)" : "1.5px solid var(--linear-color-ink-tertiary)",
          boxSizing: "border-box",
        }}
      />
      {children}
    </div>
  );
}

export function StepFooter({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  busy,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  busy?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
      <div>{onBack ? <Button label="Back" variant="secondary" size="md" onClick={onBack} /> : null}</div>
      {onNext ? (
        <Button
          label={busy ? "Working…" : nextLabel}
          variant="primary"
          size="md"
          disabled={nextDisabled || busy}
          onClick={onNext}
        />
      ) : null}
    </div>
  );
}

export function WhenPicker({
  value,
  onChange,
}: {
  value: WhenValue;
  onChange: (next: WhenValue) => void;
}) {
  return (
    <div>
      <SectionLabel>When?</SectionLabel>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <ChoicePill label="Now" selected={value.mode === "now"} onSelect={() => onChange({ mode: "now", local: value.local })} />
        <ChoicePill label="Pick time" selected={value.mode === "at"} onSelect={() => onChange({ mode: "at", local: value.local })} />
        {value.mode === "at" ? (
          <input
            type="datetime-local"
            aria-label="Send time"
            value={value.local}
            onChange={(e) => onChange({ mode: "at", local: e.target.value })}
            style={{ ...fieldStyle, width: "auto", height: 32, paddingInline: 8 }}
          />
        ) : null}
      </div>
    </div>
  );
}

export type WhenValue = { mode: "now" | "at"; local: string };

/** Converts the picker value to the API shape; null when "pick time" has no valid future time. */
export function whenToChoice(value: WhenValue): { mode: "now" } | { mode: "at"; at: string } | null {
  if (value.mode === "now") return { mode: "now" };
  const t = Date.parse(value.local);
  if (!value.local || Number.isNaN(t) || t <= Date.now()) return null;
  return { mode: "at", at: new Date(t).toISOString() };
}

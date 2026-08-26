"use client";

import { parseDate, type CalendarDate } from "@internationalized/date";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Button as AriaButton,
  Calendar as AriaCalendar,
  CalendarCell as AriaCalendarCell,
  CalendarGrid as AriaCalendarGrid,
  CalendarGridBody as AriaCalendarGridBody,
  CalendarGridHeader as AriaCalendarGridHeader,
  CalendarHeaderCell as AriaCalendarHeaderCell,
  DatePicker as AriaDatePicker,
  Dialog as AriaDialog,
  Group as AriaGroup,
  Heading as AriaHeading,
  Popover as AriaPopover,
} from "react-aria-components";
import { useThemeMode } from "@/components/patterns/foundation/ThemeContext";
import { linearTokenVars } from "@/theme/linearTokens";

export type LinearDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Compact trigger for settings rows. */
  size?: "default" | "compact";
};

function toCalendarDate(value: string): CalendarDate | null {
  if (!value) return null;
  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

function formatIso(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const fieldLabelStyle = { fontSize: 12, color: "var(--linear-color-ink-subtle)" } as const;

/**
 * Linear-token calendar popover. ISO yyyy-mm-dd in/out; closes on select.
 */
export function LinearDatePicker({
  value,
  onChange,
  label,
  placeholder = "Select date",
  disabled,
  size = "default",
}: LinearDatePickerProps) {
  const parsed = toCalendarDate(value);
  const compact = size === "compact";
  const { mode } = useThemeMode();

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      {label ? <span style={fieldLabelStyle}>{label}</span> : null}
      <AriaDatePicker
        aria-label={label ?? placeholder}
        value={parsed}
        isDisabled={disabled}
        shouldCloseOnSelect
        onChange={(next) => onChange(next ? next.toString() : "")}
      >
        <AriaGroup>
          <AriaButton
            style={{
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              width: "100%",
              height: compact ? 30 : 32,
              paddingInline: 8,
              borderRadius: 6,
              border: "var(--linear-border-width) solid var(--linear-color-hairline)",
              background: "var(--linear-color-canvas)",
              color: value ? "var(--linear-color-ink)" : "var(--linear-color-ink-subtle)",
              fontSize: 13,
              fontFamily: "inherit",
              cursor: disabled ? "not-allowed" : "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {value ? formatIso(value) : placeholder}
            </span>
            <CalendarIcon size={14} strokeWidth={1.75} />
          </AriaButton>
        </AriaGroup>
        <AriaPopover
          offset={6}
          placement="bottom start"
          className="linear-date-picker-popover"
          style={{
            ...linearTokenVars,
            colorScheme: mode,
            zIndex: 400,
            boxSizing: "border-box",
            padding: 12,
            background: "var(--linear-color-side-panel)",
            color: "var(--linear-color-ink)",
            border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
            borderRadius: "var(--linear-radius-md)",
            boxShadow: "var(--linear-shadow-side-panel)",
          }}
        >
          <AriaDialog
            aria-label="Choose date"
            style={{
              outline: "none",
              background: "var(--linear-color-side-panel)",
              color: "inherit",
            }}
          >
            <AriaCalendar>
              <header
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <AriaButton
                  slot="previous"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    border: "none",
                    background: "transparent",
                    color: "var(--linear-color-ink)",
                    cursor: "pointer",
                    borderRadius: 6,
                  }}
                >
                  <ChevronLeft size={16} strokeWidth={1.75} />
                </AriaButton>
                <AriaHeading
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--linear-color-ink)",
                  }}
                />
                <AriaButton
                  slot="next"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    border: "none",
                    background: "transparent",
                    color: "var(--linear-color-ink)",
                    cursor: "pointer",
                    borderRadius: 6,
                  }}
                >
                  <ChevronRight size={16} strokeWidth={1.75} />
                </AriaButton>
              </header>
              <AriaCalendarGrid weekdayStyle="short">
                <AriaCalendarGridHeader>
                  {(day) => (
                    <AriaCalendarHeaderCell
                      style={{
                        width: 32,
                        height: 28,
                        fontSize: 11,
                        fontWeight: 500,
                        color: "var(--linear-color-ink-subtle)",
                        textAlign: "center",
                      }}
                    >
                      {day.slice(0, 2)}
                    </AriaCalendarHeaderCell>
                  )}
                </AriaCalendarGridHeader>
                <AriaCalendarGridBody>
                  {(date) => (
                    <AriaCalendarCell
                      date={date}
                      className="linear-date-picker-cell"
                      style={{
                        width: 32,
                        height: 32,
                        fontSize: 13,
                        textAlign: "center",
                        borderRadius: 6,
                        cursor: "pointer",
                        border: "none",
                        background: "transparent",
                        color: "var(--linear-color-ink)",
                      }}
                    />
                  )}
                </AriaCalendarGridBody>
              </AriaCalendarGrid>
            </AriaCalendar>
          </AriaDialog>
        </AriaPopover>
      </AriaDatePicker>
      <style>{`
        .linear-date-picker-popover {
          background: var(--linear-color-side-panel) !important;
        }
        /* globals.css styles tbody tr:hover as gray-50; the popover is portaled
           outside .admin-migrate-root so that rule would paint a white week row. */
        .linear-date-picker-popover table,
        .linear-date-picker-popover tbody,
        .linear-date-picker-popover tr,
        .linear-date-picker-popover tr:hover,
        .linear-date-picker-popover tr:focus,
        .linear-date-picker-popover tr:focus-within,
        .linear-date-picker-popover td,
        .linear-date-picker-popover th {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .linear-date-picker-popover td,
        .linear-date-picker-popover th {
          padding: 0 !important;
        }
        .linear-date-picker-cell {
          outline: none !important;
        }
        .linear-date-picker-cell[data-hovered]:not([data-selected]),
        .linear-date-picker-cell[data-focused]:not([data-selected]) {
          background: var(--linear-color-surface-3) !important;
          color: var(--linear-color-ink) !important;
        }
        .linear-date-picker-cell[data-selected] {
          background: var(--linear-color-ink) !important;
          color: var(--linear-color-canvas) !important;
        }
        .linear-date-picker-cell[data-outside-month] {
          color: var(--linear-color-ink-subtle) !important;
          opacity: 0.45;
        }
        .linear-date-picker-cell[data-outside-month][data-selected] {
          opacity: 1;
        }
      `}</style>
    </label>
  );
}

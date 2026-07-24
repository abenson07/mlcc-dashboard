"use client";

import { parseDate, type CalendarDate } from "@internationalized/date";
import { DatePicker as UntitledDatePicker } from "@/components/application/date-picker/date-picker";
import Label from "./Label";

type DatePickerFieldProps = {
  id?: string;
  label?: string;
  value: string; // ISO yyyy-mm-dd, "" for empty
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string; // ISO yyyy-mm-dd
};

function toCalendarDate(value: string): CalendarDate | null {
  if (!value) return null;
  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

export default function DatePickerField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  min,
}: DatePickerFieldProps) {
  const minValue = min ? toCalendarDate(min) : null;

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <UntitledDatePicker
        id={id}
        aria-label={label ?? placeholder ?? "Date"}
        value={toCalendarDate(value)}
        onChange={(next) => onChange(next ? next.toString() : "")}
        minValue={minValue ?? undefined}
        isDisabled={disabled}
      />
    </div>
  );
}

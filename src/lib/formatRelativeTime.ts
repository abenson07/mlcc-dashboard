/**
 * Human-readable relative times for stacked table cells:
 * primary line = relative (or absolute once the span is long enough),
 * secondary line = calendar date when primary is relative.
 */

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Whole calendar days from `earlier` to `later` (local), both instants. */
export function calendarDaysBetween(earlier: Date, later: Date): number {
  const ms = startOfLocalDay(later).getTime() - startOfLocalDay(earlier).getTime();
  return Math.floor(ms / 86400000);
}

/** Whole calendar months from `earlier` to `later` (local). */
export function fullMonthsElapsed(earlier: Date, later: Date): number {
  let months =
    (later.getFullYear() - earlier.getFullYear()) * 12 + (later.getMonth() - earlier.getMonth());
  if (later.getDate() < earlier.getDate()) months -= 1;
  return Math.max(0, months);
}

export function formatShortDate(input: string | Date): string {
  try {
    const d = typeof input === "string" ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return typeof input === "string" ? input : "—";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return typeof input === "string" ? input : "—";
  }
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

export type StackedRelativeResult = {
  primary: string;
  /** Omitted when primary is already the absolute date (2+ years in the past). */
  secondary?: string;
};

/**
 * Past-only: "Added", "created", etc.
 * Rules: show absolute date only on secondary while primary is relative; from 24+ months ago,
 * primary becomes the calendar date and secondary is dropped.
 */
export function formatStackedRelativePast(input: string | Date, nowInput: Date = new Date()): StackedRelativeResult {
  const then = typeof input === "string" ? new Date(input) : input;
  const now = nowInput;
  if (Number.isNaN(then.getTime())) return { primary: typeof input === "string" ? input : "—" };

  const abs = formatShortDate(then);
  if (then >= now) {
    return { primary: abs, secondary: undefined };
  }

  const ms = now.getTime() - then.getTime();
  const calDays = calendarDaysBetween(then, now);
  const monthsElapsed = fullMonthsElapsed(then, now);

  if (monthsElapsed >= 24) {
    return { primary: abs };
  }
  if (monthsElapsed >= 18) {
    return { primary: "About 2 years ago", secondary: abs };
  }
  if (monthsElapsed >= 12) {
    return { primary: "About a year ago", secondary: abs };
  }
  if (monthsElapsed >= 1 && monthsElapsed <= 11) {
    return {
      primary: `${monthsElapsed} ${plural(monthsElapsed, "month", "months")} ago`,
      secondary: abs,
    };
  }

  if (calDays >= 7) {
    const weeks = Math.min(4, Math.floor(calDays / 7));
    return {
      primary: `${weeks} ${plural(weeks, "week", "weeks")} ago`,
      secondary: abs,
    };
  }

  if (calDays >= 1 && calDays <= 6) {
    return {
      primary: `${calDays} ${plural(calDays, "day", "days")} ago`,
      secondary: abs,
    };
  }

  const hours = Math.floor(ms / 3600000);
  if (hours >= 1 && hours <= 23) {
    return { primary: `${hours} ${plural(hours, "hour", "hours")} ago`, secondary: abs };
  }

  const minutes = Math.floor(ms / 60000);
  if (minutes >= 1) {
    return {
      primary: `${minutes} ${plural(minutes, "minute", "minutes")} ago`,
      secondary: abs,
    };
  }

  return { primary: "Just now", secondary: abs };
}

/**
 * Future due dates (invoices, deadlines): mirrors past buckets with "in …" phrasing.
 * Only valid when `then > now`. From 24+ months out, returns the calendar date
 * (call sites should omit redundant secondary).
 */
export function formatRelativeFutureLabel(input: string | Date, nowInput: Date = new Date()): string {
  const then = typeof input === "string" ? new Date(input) : input;
  const now = nowInput;
  if (Number.isNaN(then.getTime())) return typeof input === "string" ? input : "—";

  const abs = formatShortDate(then);
  const ms = then.getTime() - now.getTime();
  const calDays = calendarDaysBetween(now, then);
  const monthsUntil = fullMonthsElapsed(now, then);

  if (monthsUntil >= 24) {
    return abs;
  }
  if (monthsUntil >= 18) {
    return "In about 2 years";
  }
  if (monthsUntil >= 12) {
    return "In about a year";
  }
  if (monthsUntil >= 1 && monthsUntil <= 11) {
    return `In ${monthsUntil} ${plural(monthsUntil, "month", "months")}`;
  }

  if (calDays >= 7) {
    const weeks = Math.min(4, Math.floor(calDays / 7));
    return `In ${weeks} ${plural(weeks, "week", "weeks")}`;
  }

  if (calDays >= 2 && calDays <= 6) {
    return `In ${calDays} ${plural(calDays, "day", "days")}`;
  }

  if (calDays === 1) {
    return "Tomorrow";
  }

  const hours = Math.floor(ms / 3600000);
  if (hours >= 1 && hours <= 23) {
    return `In ${hours} ${plural(hours, "hour", "hours")}`;
  }

  const minutes = Math.floor(ms / 60000);
  if (minutes >= 1) {
    return `In ${minutes} ${plural(minutes, "minute", "minutes")}`;
  }

  if (ms > 0) {
    return "In less than a minute";
  }

  return abs;
}

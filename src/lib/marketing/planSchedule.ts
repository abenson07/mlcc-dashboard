/**
 * Pure schedule generator for event outreach plans.
 * Dates are `YYYY-MM-DD` in Pacific time so "days out" matches what staff see.
 */

export type PlanIntensity = "light" | "standard" | "heavy";
export type PlanChannel = "facebook" | "instagram" | "email";
export type TouchKind = "announcement" | "reminder" | "day-before" | "day-of";

export type PlanTouch = {
  id: string;
  /** `YYYY-MM-DD` (Pacific). */
  date: string;
  channel: PlanChannel;
  kind: TouchKind;
  /** Days before the event (0 = event day). */
  daysBefore: number;
};

/** Days-before-event offsets, largest first. The first one that fits becomes the announcement. */
const OFFSETS: Record<PlanIntensity, number[]> = {
  light: [14, 3, 1],
  standard: [21, 14, 7, 3, 1, 0],
  heavy: [28, 21, 14, 10, 7, 5, 3, 2, 1, 0],
};

/** Offsets where email is sent in addition to the announcement and day-before. */
const EMAIL_REMINDER_OFFSETS = new Set([7, 3]);

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDay(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function formatDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function daysBetween(fromDay: string, toDay: string): number {
  return Math.round((parseDay(toDay) - parseDay(fromDay)) / DAY_MS);
}

/** `YYYY-MM-DD` for an instant, as seen in Pacific time. */
export function toPacificDay(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** ISO instant for 9:00am Pacific on the given day (handles DST). */
export function pacificNineAmIso(day: string): string {
  for (const utcHour of [16, 17]) {
    const [y, m, d] = day.split("-").map(Number);
    const candidate = new Date(Date.UTC(y, m - 1, d, utcHour, 0, 0));
    const hour = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      hour12: false,
    }).format(candidate);
    if (Number(hour) % 24 === 9) return candidate.toISOString();
  }
  return new Date(parseDay(day) + 17 * 60 * 60 * 1000).toISOString();
}

function kindFor(daysBefore: number, isFirst: boolean): TouchKind {
  if (isFirst) return "announcement";
  if (daysBefore === 0) return "day-of";
  if (daysBefore === 1) return "day-before";
  return "reminder";
}

export type BuildPlanInput = {
  /** Event day, `YYYY-MM-DD` Pacific. */
  eventDay: string;
  /** Today, `YYYY-MM-DD` Pacific. */
  today: string;
  intensity: PlanIntensity;
  channels: PlanChannel[];
};

export type BuiltPlan = {
  daysOut: number;
  touches: PlanTouch[];
};

export function buildPlan({ eventDay, today, intensity, channels }: BuildPlanInput): BuiltPlan {
  const daysOut = daysBetween(today, eventDay);
  if (daysOut < 0 || channels.length === 0) return { daysOut, touches: [] };

  const fitting = OFFSETS[intensity].filter((o) => o <= daysOut);
  // Event is further out than the biggest offset allows? Still announce right away
  // when the first fitting offset leaves a gap (e.g. 9 days out, first slot is 7).
  const offsets = [...fitting];
  if (offsets.length === 0 || offsets[0] < daysOut) {
    if (daysOut > 0) offsets.unshift(daysOut);
  }

  const touches: PlanTouch[] = [];
  offsets.forEach((daysBefore, index) => {
    const kind = kindFor(daysBefore, index === 0);
    const date = formatDay(parseDay(eventDay) - daysBefore * DAY_MS);
    for (const channel of channels) {
      if (channel === "email") {
        const emailOk =
          kind === "announcement" ||
          kind === "day-before" ||
          EMAIL_REMINDER_OFFSETS.has(daysBefore);
        if (!emailOk) continue;
      }
      touches.push({
        id: `${date}-${channel}`,
        date,
        channel,
        kind,
        daysBefore,
      });
    }
  });

  return { daysOut, touches };
}

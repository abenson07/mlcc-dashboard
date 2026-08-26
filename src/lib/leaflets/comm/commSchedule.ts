import type { CommSettings, LeafletCommSchedule } from "@/types/database";

export const LEAFLET_COMM_STEP_ORDER = [
  "initial_confirmation",
  "confirmation_followup",
  "pre_distribution_reminder",
] as const;

export type LeafletCommStepKey = (typeof LEAFLET_COMM_STEP_ORDER)[number];

export type { LeafletCommSchedule };

export const LEAFLET_COMM_STEP_DEFS: {
  step_key: LeafletCommStepKey;
  name: string;
  offset_days: number | null;
  requires_response: boolean;
}[] = [
  {
    step_key: "initial_confirmation",
    name: "Initial reminder",
    offset_days: null,
    requires_response: true,
  },
  {
    step_key: "confirmation_followup",
    name: "Follow-up",
    offset_days: -21,
    requires_response: true,
  },
  {
    step_key: "pre_distribution_reminder",
    name: "Pre-distribution reminder",
    offset_days: -14,
    requires_response: false,
  },
];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function calendarDateToday(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addCalendarDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetweenDates(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T12:00:00`);
  const to = new Date(`${toIso}T12:00:00`);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function parseCommSchedule(value: unknown): LeafletCommSchedule {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: LeafletCommSchedule = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "string" && DATE_RE.test(raw)) {
      out[key as LeafletCommStepKey] = raw;
    }
  }
  return out;
}

export function snapshotCommSchedule(
  steps: { step_key: string; offset_days: number | null }[],
  distributionDate: string,
  today: string = calendarDateToday(),
): LeafletCommSchedule {
  const out: LeafletCommSchedule = {};
  for (const step of steps) {
    const key = step.step_key as LeafletCommStepKey;
    out[key] =
      step.offset_days == null ? today : addCalendarDays(distributionDate, step.offset_days);
  }
  return out;
}

/** Stored dates win; missing keys fall back to workback offsets from distribution. */
export function resolveCommSchedule(
  stored: unknown,
  steps: { step_key: string; offset_days: number | null }[],
  distributionDate: string,
): LeafletCommSchedule {
  if (!distributionDate) return parseCommSchedule(stored);
  return {
    ...snapshotCommSchedule(steps, distributionDate),
    ...parseCommSchedule(stored),
  };
}

export function isLeafletPipelineStep(stepKey: string): stepKey is LeafletCommStepKey {
  return (LEAFLET_COMM_STEP_ORDER as readonly string[]).includes(stepKey);
}

export function isUnconfirmedOnlyStep(stepKey: string): boolean {
  return stepKey === "confirmation_followup";
}

export function offsetDescription(offsetDays: number | null, stepKey?: string): string {
  const audience =
    stepKey === "confirmation_followup" ? "Only deliverers who have not confirmed. " : "";
  if (offsetDays == null) return `${audience}Not tied to distribution — send when you're ready`.trim();
  if (offsetDays < 0) {
    const n = Math.abs(offsetDays);
    return `${audience}${n} day${n === 1 ? "" : "s"} before distribution`.trim();
  }
  if (offsetDays > 0) {
    return `${audience}${offsetDays} day${offsetDays === 1 ? "" : "s"} after distribution`.trim();
  }
  return `${audience}On distribution day`.trim();
}

export function upcomingTimingLabel(scheduledOn: string | undefined, today: string = calendarDateToday()): string {
  if (!scheduledOn) return "Upcoming";
  const days = daysBetweenDates(today, scheduledOn);
  if (days === 0) return "Today";
  if (days === 1) return "In 1 day";
  if (days > 1) return `In ${days} days`;
  if (days === -1) return "Due 1 day ago";
  return `Due ${Math.abs(days)} days ago`;
}

export function leafletCommSettingsFromDefs(): CommSettings[] {
  return LEAFLET_COMM_STEP_DEFS.map((def) => ({
    id: `leaflet-comm-${def.step_key}`,
    context: "leaflet" as const,
    event_template_id: null,
    name: def.name,
    step_key: def.step_key,
    resend_template_id: "",
    trigger: def.offset_days == null ? ("on_activate" as const) : ("anchor_offset" as const),
    offset_days: def.offset_days,
    offset_time: "09:00",
    requires_response: def.requires_response,
    is_enabled: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  }));
}

/** Pipeline order, display names from defs; live rows win for ids/templates. */
export function pipelineLeafletCommSettings(live: CommSettings[]): CommSettings[] {
  const defs = leafletCommSettingsFromDefs();
  const byKey = new Map(live.map((row) => [row.step_key, row]));
  return defs.map((def) => {
    const liveRow = byKey.get(def.step_key);
    return liveRow ? { ...liveRow, name: def.name } : def;
  });
}

export function isCommSchedulePatch(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value as Record<string, unknown>).every(
    (v) => typeof v === "string" && DATE_RE.test(v),
  );
}

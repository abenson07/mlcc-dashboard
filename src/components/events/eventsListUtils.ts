import type { WebflowEventItemDTO } from "hooks";

export type EventsListRange = "upcoming" | "past";

export function parseListRange(sp: URLSearchParams | null): EventsListRange {
  return sp?.get("range") === "past" ? "past" : "upcoming";
}

export function eventsListHref(range?: EventsListRange): string {
  return range === "past" ? "/events?range=past" : "/events";
}

export function formatEventDateTime(raw: unknown): string {
  if (raw === undefined || raw === null) return "—";
  const str = typeof raw === "string" ? raw : String(raw);
  if (!str.trim()) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(str.trim())) {
    return new Date(`${str.trim()}T12:00:00`).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return str;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function eventSiteStatus(row: WebflowEventItemDTO): {
  label: string;
  color: "success" | "warning" | "light";
} {
  if (row.isArchived) return { label: "Archived", color: "warning" };
  if (row.isDraft) return { label: "Draft", color: "light" };
  return { label: "Published", color: "success" };
}

function todayIsoLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function readDateKey(fd: Record<string, unknown>, slug: string | null): string | null {
  if (!slug) return null;
  const v = fd[slug];
  if (typeof v !== "string" || !v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function partitionEventsByRange(
  items: WebflowEventItemDTO[],
  calSlug: string | null,
): { upcoming: WebflowEventItemDTO[]; past: WebflowEventItemDTO[] } {
  const t = todayIsoLocal();
  const active = items.filter((i) => !i.isArchived);
  const withDay = active.filter((i) => readDateKey(i.fieldData ?? {}, calSlug));

  const upcoming = withDay
    .filter((i) => {
      const day = readDateKey(i.fieldData ?? {}, calSlug);
      return day && day >= t;
    })
    .sort((a, b) => {
      const da = readDateKey(a.fieldData ?? {}, calSlug) ?? "";
      const db = readDateKey(b.fieldData ?? {}, calSlug) ?? "";
      return da.localeCompare(db);
    });

  const past = withDay
    .filter((i) => {
      const day = readDateKey(i.fieldData ?? {}, calSlug);
      return day && day < t;
    })
    .sort((a, b) => {
      const da = readDateKey(a.fieldData ?? {}, calSlug) ?? "";
      const db = readDateKey(b.fieldData ?? {}, calSlug) ?? "";
      return db.localeCompare(da);
    });

  return { upcoming, past };
}

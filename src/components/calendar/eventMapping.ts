import type { EventInput } from "@fullcalendar/core";
import type { WebflowEventItemDTO } from "hooks";

export interface WebflowCalendarExtras {
  calendar: string;
  itemId: string;
}

function startFallback(): string {
  return new Date().toISOString().slice(0, 10);
}

export function webflowItemToEventInput(
  item: WebflowEventItemDTO,
  titleFieldSlug: string,
  calendarFieldSlug: string | null
): EventInput {
  const fd = item.fieldData ?? {};
  const title = String(fd[titleFieldSlug] ?? fd.name ?? "Untitled");
  const color = "Primary";

  if (!calendarFieldSlug) {
    return {
      id: item.id,
      title,
      allDay: true,
      start: startFallback(),
      extendedProps: { calendar: color, itemId: item.id } satisfies WebflowCalendarExtras,
    };
  }

  const raw = fd[calendarFieldSlug];
  const str = typeof raw === "string" ? raw : raw != null ? String(raw) : "";
  if (!str) {
    return {
      id: item.id,
      title,
      allDay: true,
      start: startFallback(),
      extendedProps: { calendar: color, itemId: item.id } satisfies WebflowCalendarExtras,
    };
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(str.trim())) {
    return {
      id: item.id,
      title,
      allDay: true,
      start: str.trim(),
      extendedProps: { calendar: color, itemId: item.id } satisfies WebflowCalendarExtras,
    };
  }

  const d = new Date(str);
  if (Number.isNaN(d.getTime())) {
    return {
      id: item.id,
      title,
      allDay: true,
      start: startFallback(),
      extendedProps: { calendar: color, itemId: item.id } satisfies WebflowCalendarExtras,
    };
  }

  return {
    id: item.id,
    title,
    allDay: false,
    start: d.toISOString(),
    extendedProps: { calendar: color, itemId: item.id } satisfies WebflowCalendarExtras,
  };
}

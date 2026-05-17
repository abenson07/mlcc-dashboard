import type { WebflowEventItemDTO, WebflowEventsPayload } from "hooks";

function readStr(v: unknown): string {
  if (v == null) return "";
  return typeof v === "string" ? v.trim() : String(v);
}

function formatWebflowEventLabel(
  item: WebflowEventItemDTO,
  titleFieldSlug: string,
  calendarFieldSlug: string | null
): string {
  const fd = item.fieldData ?? {};
  const title = readStr(fd[titleFieldSlug] || fd.name) || "Untitled event";
  const startRaw = calendarFieldSlug ? fd[calendarFieldSlug] : null;
  const start = readStr(startRaw);
  if (!start) return title;
  const d = new Date(start);
  if (Number.isNaN(d.getTime())) return title;
  const dateLabel = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${title} — ${dateLabel}`;
}

export function buildWebflowEventSelectOptions(
  payload: WebflowEventsPayload | undefined
): { value: string; label: string }[] {
  if (!payload) {
    return [{ value: "", label: "No linked event" }];
  }

  const items = (payload.items ?? []).filter((i) => i.isArchived !== true);
  const titleSlug = payload.titleFieldSlug || "name";
  const calendarSlug = payload.calendarFieldSlug;

  return [
    { value: "", label: "No linked event" },
    ...items.map((item) => ({
      value: item.id,
      label: formatWebflowEventLabel(item, titleSlug, calendarSlug),
    })),
  ];
}

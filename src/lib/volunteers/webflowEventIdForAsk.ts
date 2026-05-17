import type { VolunteerAskWithSignups, WebflowEventsPayload } from "hooks";

function readStr(v: unknown): string {
  if (v == null) return "";
  return typeof v === "string" ? v.trim() : String(v);
}

/** Best-effort match of a linked Supabase event name to a Webflow events CMS item id. */
export function webflowEventIdForAsk(
  ask: Pick<VolunteerAskWithSignups, "event">,
  payload: WebflowEventsPayload | undefined
): string {
  const eventName = ask.event?.name?.trim().toLowerCase();
  if (!eventName || !payload?.items?.length) return "";

  const titleSlug = payload.titleFieldSlug || "name";
  const match = payload.items.find((item) => {
    if (item.isArchived === true) return false;
    const fd = item.fieldData ?? {};
    const title = readStr(fd[titleSlug] || fd.name).toLowerCase();
    return title === eventName;
  });

  return match?.id ?? "";
}

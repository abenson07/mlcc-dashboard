import type { VolunteerAskWithSignups } from "hooks";

export type VolunteerEventGroup = {
  eventId: string | null;
  eventLabel: string;
  eventDate: string | null;
  asks: VolunteerAskWithSignups[];
};

export function groupVolunteerAsksByEvent(
  asks: VolunteerAskWithSignups[]
): VolunteerEventGroup[] {
  const map = new Map<string, VolunteerEventGroup>();

  for (const ask of asks) {
    const eventId = ask.event_id;
    const key = eventId ?? "__none__";
    let group = map.get(key);
    if (!group) {
      const name = ask.event?.name?.trim();
      group = {
        eventId,
        eventLabel: name || (eventId ? "Untitled event" : "General / no event"),
        eventDate: ask.event?.date ?? null,
        asks: [],
      };
      map.set(key, group);
    }
    group.asks.push(ask);
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.eventDate && b.eventDate) {
      return a.eventDate.localeCompare(b.eventDate);
    }
    if (a.eventDate) return -1;
    if (b.eventDate) return 1;
    return a.eventLabel.localeCompare(b.eventLabel);
  });
}

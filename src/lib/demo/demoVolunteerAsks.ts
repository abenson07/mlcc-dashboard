import type { SampleVolunteerAsk } from "@/data/mocks/committees";
import { getSampleVolunteerAsks } from "@/data/mocks/committees";
import type { CommitteeSlug } from "schemas/committee_meetings";

const STORAGE_KEY = "admin-migrate-demo-volunteer-asks:v1";
export const DEMO_VOLUNTEER_ASKS_EVENT = "admin-migrate-demo-volunteer-asks";

function readAll(): SampleVolunteerAsk[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SampleVolunteerAsk[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(rows: SampleVolunteerAsk[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event(DEMO_VOLUNTEER_ASKS_EVENT));
}

/** Sample seed + any session-created/edited asks for this committee. */
export function listDemoVolunteerAsks(committee: CommitteeSlug): SampleVolunteerAsk[] {
  const stored = readAll().filter((a) => a.committee === committee);
  if (stored.length > 0) return stored;
  return getSampleVolunteerAsks(committee);
}

export function upsertDemoVolunteerAsk(ask: SampleVolunteerAsk): void {
  const others = readAll().filter((a) => a.id !== ask.id);
  // Keep other committees' rows; replace this committee's seed-only state by merging.
  const sameCommittee = others.filter((a) => a.committee === ask.committee);
  const otherCommittees = others.filter((a) => a.committee !== ask.committee);
  if (sameCommittee.length === 0) {
    // First write for this committee — seed defaults then upsert.
    const seeded = getSampleVolunteerAsks(ask.committee).filter((a) => a.id !== ask.id);
    writeAll([...otherCommittees, ask, ...seeded]);
    return;
  }
  writeAll([ask, ...others]);
}

export function removeDemoVolunteerAsk(id: string, committee: CommitteeSlug): void {
  const existing = readAll();
  if (existing.length === 0) {
    // Persist seed minus removed so Overview/Settings stay in sync.
    writeAll(getSampleVolunteerAsks(committee).filter((a) => a.id !== id));
    return;
  }
  writeAll(existing.filter((a) => a.id !== id));
}

export function replaceDemoVolunteerAsks(
  committee: CommitteeSlug,
  asks: SampleVolunteerAsk[],
): void {
  const others = readAll().filter((a) => a.committee !== committee);
  writeAll([...asks, ...others]);
}

import type { CommitteeInitiative } from "@/data/mocks/committees";

const STORAGE_KEY = "admin-migrate-demo-initiatives:v1";

function readAll(): CommitteeInitiative[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CommitteeInitiative[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(rows: CommitteeInitiative[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function listDemoInitiatives(): CommitteeInitiative[] {
  return readAll();
}

export function getDemoInitiative(id: string): CommitteeInitiative | null {
  return readAll().find((i) => i.id === id) ?? null;
}

export function upsertDemoInitiative(initiative: CommitteeInitiative): void {
  const rows = readAll().filter((i) => i.id !== initiative.id);
  rows.unshift(initiative);
  writeAll(rows);
}

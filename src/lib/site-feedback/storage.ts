"use client";

import type { SiteFeedbackBatchMeta, SiteFeedbackComment } from "./types";

const DRAFTS_KEY = "mlcc-site-feedback-drafts";
const BATCH_KEY = "mlcc-site-feedback-batch";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadDraftComments(): SiteFeedbackComment[] {
  return readJson<SiteFeedbackComment[]>(DRAFTS_KEY, []);
}

export function saveDraftComments(comments: SiteFeedbackComment[]) {
  writeJson(DRAFTS_KEY, comments);
}

export function loadBatchMeta(): SiteFeedbackBatchMeta | null {
  return readJson<SiteFeedbackBatchMeta | null>(BATCH_KEY, null);
}

export function saveBatchMeta(meta: SiteFeedbackBatchMeta | null) {
  if (!meta) {
    if (typeof window !== "undefined") window.localStorage.removeItem(BATCH_KEY);
    return;
  }
  writeJson(BATCH_KEY, meta);
}

export function clearDraftComments() {
  if (typeof window !== "undefined") window.localStorage.removeItem(DRAFTS_KEY);
}

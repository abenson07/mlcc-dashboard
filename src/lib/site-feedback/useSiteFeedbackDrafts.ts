"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearDraftComments,
  loadBatchMeta,
  loadDraftComments,
  saveBatchMeta,
  saveDraftComments,
} from "./storage";
import type { SiteFeedbackBatchMeta, SiteFeedbackComment } from "./types";

export function useSiteFeedbackDrafts() {
  const [comments, setComments] = useState<SiteFeedbackComment[]>([]);
  const [batchMeta, setBatchMeta] = useState<SiteFeedbackBatchMeta | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setComments(loadDraftComments());
    setBatchMeta(loadBatchMeta());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveDraftComments(comments);
  }, [comments, hydrated]);

  const addComment = useCallback((comment: Omit<SiteFeedbackComment, "id" | "createdAt">) => {
    const next: SiteFeedbackComment = {
      ...comment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [next, ...prev]);
    return next;
  }, []);

  const updateComment = useCallback((id: string, body: string) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, body } : c)));
  }, []);

  const deleteComment = useCallback((id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearComments = useCallback(() => {
    setComments([]);
    clearDraftComments();
  }, []);

  const setSubmittedBatch = useCallback((meta: SiteFeedbackBatchMeta) => {
    setBatchMeta(meta);
    saveBatchMeta(meta);
  }, []);

  const clearBatchMeta = useCallback(() => {
    setBatchMeta(null);
    saveBatchMeta(null);
  }, []);

  return {
    comments,
    batchMeta,
    hydrated,
    addComment,
    updateComment,
    deleteComment,
    clearComments,
    setSubmittedBatch,
    clearBatchMeta,
  };
}

export function formatCommentDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function commentDisplayLabel(comment: SiteFeedbackComment): string {
  if (comment.scope === "page") return "Page";
  return comment.editableLabel ?? comment.editableId ?? comment.editableType ?? "Element";
}

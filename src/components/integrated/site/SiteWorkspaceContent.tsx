"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SITE_ROUTES } from "@marketing/data/site-routes";
import { getApiBase } from "@/lib/apiBase";
import type { EditableAnchor } from "@/lib/site-feedback/types";
import { useSiteFeedbackDrafts } from "@/lib/site-feedback/useSiteFeedbackDrafts";
import { IconChevronDown } from "@/components/leaflet/icons";
import IntegratedTopbar from "../IntegratedTopbar";
import SiteCommentsPanel from "./SiteCommentsPanel";
import SitePreviewFrame from "./SitePreviewFrame";

type SiteWorkspaceContentProps = {
  initialCommentMode?: boolean;
};

export default function SiteWorkspaceContent({
  initialCommentMode = false,
}: SiteWorkspaceContentProps) {
  const [pagePath, setPagePath] = useState("/");
  const [commentMode, setCommentMode] = useState(initialCommentMode);
  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  const [selectedAnchor, setSelectedAnchor] = useState<EditableAnchor | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const pageMenuRef = useRef<HTMLDivElement>(null);

  const {
    comments,
    batchMeta,
    hydrated,
    addComment,
    updateComment,
    deleteComment,
    clearComments,
    setSubmittedBatch,
  } = useSiteFeedbackDrafts();

  const pageLabel = useMemo(
    () => SITE_ROUTES.find((route) => route.path === pagePath)?.label ?? pagePath,
    [pagePath],
  );

  useEffect(() => {
    if (!pageMenuOpen) return;
    function handleClick(event: MouseEvent) {
      if (pageMenuRef.current && !pageMenuRef.current.contains(event.target as Node)) {
        setPageMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [pageMenuOpen]);

  const handleSelectElement = useCallback((anchor: EditableAnchor) => {
    setSelectedAnchor(anchor);
  }, []);

  const handleAddElementComment = useCallback(
    (body: string, anchor: EditableAnchor) => {
      addComment({
        pagePath,
        scope: "element",
        editableId: anchor.editableId,
        editableType: anchor.editableType,
        editableLabel: anchor.editableLabel,
        textSnippet: anchor.textSnippet,
        body,
      });
      toast.success("Comment added");
    },
    [addComment, pagePath],
  );

  const handleAddPageComment = useCallback(
    (body: string) => {
      addComment({
        pagePath,
        scope: "page",
        body,
      });
      toast.success("Page comment added");
    },
    [addComment, pagePath],
  );

  const handleSubmitBatch = useCallback(async () => {
    if (comments.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/site/feedback/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments }),
      });
      const data = (await res.json()) as {
        error?: string;
        issueId?: string;
        url?: string;
        identifier?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to submit feedback batch.");
        return;
      }
      setSubmittedBatch({
        linearIssueId: data.issueId,
        linearUrl: data.url,
        linearIdentifier: data.identifier,
        submittedAt: new Date().toISOString(),
      });
      clearComments();
      setSelectedAnchor(null);
      toast.success(`Submitted to Linear (${data.identifier ?? "issue created"}).`);
    } catch {
      toast.error("Failed to submit feedback batch.");
    } finally {
      setSubmitting(false);
    }
  }, [clearComments, comments, setSubmittedBatch]);

  const mainClass = commentMode
    ? "lf-main lf-main--site lf-main--site-comments"
    : "lf-main lf-main--site";

  if (!hydrated) {
    return (
      <div className="lf-main lf-main--site">
        <div className="lf-content-col lf-content-col--full">
          <div className="lf-site-canvas-wrap">
            <div className="lf-site-canvas lf-site-canvas--loading" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <IntegratedTopbar
        center={
          <div className="lf-site-page-picker" ref={pageMenuRef}>
            <button
              type="button"
              className="lf-context-ribbon"
              aria-expanded={pageMenuOpen}
              onClick={() => setPageMenuOpen((open) => !open)}
            >
              {pageLabel}
              <IconChevronDown />
            </button>
            {pageMenuOpen ? (
              <div className="lf-site-page-dropdown" role="menu">
                {SITE_ROUTES.map((route) => (
                  <button
                    key={route.path}
                    type="button"
                    role="menuitem"
                    className={
                      route.path === pagePath
                        ? "lf-site-page-dropdown-item lf-site-page-dropdown-item--active"
                        : "lf-site-page-dropdown-item"
                    }
                    onClick={() => {
                      setPagePath(route.path);
                      setSelectedAnchor(null);
                      setPageMenuOpen(false);
                    }}
                  >
                    {route.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        }
        primaryAction={
          <button
            type="button"
            className={commentMode ? "lf-btn lf-btn--active" : "lf-btn lf-btn--outline"}
            onClick={() => {
              setCommentMode((open) => !open);
              if (commentMode) setSelectedAnchor(null);
            }}
          >
            {commentMode ? "Hide comments" : "Edit Site"}
          </button>
        }
      />

      <div className={mainClass}>
        <div className="lf-content-col lf-content-col--full">
          <div className="lf-site-canvas-wrap">
            <div className="lf-site-canvas">
              <SitePreviewFrame
                pagePath={pagePath}
                commentMode={commentMode}
                onSelectElement={handleSelectElement}
              />
            </div>
          </div>
        </div>

        {commentMode ? (
          <SiteCommentsPanel
            pagePath={pagePath}
            pageLabel={pageLabel}
            comments={comments}
            selectedAnchor={selectedAnchor}
            batchMeta={batchMeta}
            submitting={submitting}
            onAddElementComment={handleAddElementComment}
            onAddPageComment={handleAddPageComment}
            onUpdateComment={updateComment}
            onDeleteComment={deleteComment}
            onSubmitBatch={handleSubmitBatch}
            onClearSelection={() => setSelectedAnchor(null)}
          />
        ) : null}
      </div>
    </>
  );
}

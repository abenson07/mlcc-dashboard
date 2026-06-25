"use client";

import { useEffect, useMemo, useState } from "react";
import {
  commentDisplayLabel,
  formatCommentDate,
} from "@/lib/site-feedback/useSiteFeedbackDrafts";
import type { EditableAnchor, SiteFeedbackBatchMeta, SiteFeedbackComment } from "@/lib/site-feedback/types";

type SiteCommentsPanelProps = {
  pagePath: string;
  pageLabel: string;
  comments: SiteFeedbackComment[];
  selectedAnchor: EditableAnchor | null;
  batchMeta: SiteFeedbackBatchMeta | null;
  submitting: boolean;
  onAddElementComment: (body: string, anchor: EditableAnchor) => void;
  onAddPageComment: (body: string) => void;
  onUpdateComment: (id: string, body: string) => void;
  onDeleteComment: (id: string) => void;
  onSubmitBatch: () => void;
  onClearSelection: () => void;
};

export default function SiteCommentsPanel({
  pagePath,
  pageLabel,
  comments,
  selectedAnchor,
  batchMeta,
  submitting,
  onAddElementComment,
  onAddPageComment,
  onUpdateComment,
  onDeleteComment,
  onSubmitBatch,
  onClearSelection,
}: SiteCommentsPanelProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [pageDraft, setPageDraft] = useState("");
  const [elementDraft, setElementDraft] = useState("");

  const sortedComments = useMemo(
    () =>
      [...comments].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [comments],
  );

  useEffect(() => {
    setElementDraft("");
  }, [selectedAnchor]);

  function startEdit(comment: SiteFeedbackComment) {
    setEditingId(comment.id);
    setEditDraft(comment.body);
    setMenuOpen(null);
  }

  function saveEdit(id: string) {
    const body = editDraft.trim();
    if (!body) return;
    onUpdateComment(id, body);
    setEditingId(null);
    setEditDraft("");
  }

  function handlePageSubmit(event: React.FormEvent) {
    event.preventDefault();
    const body = pageDraft.trim();
    if (!body) return;
    onAddPageComment(body);
    setPageDraft("");
  }

  function handleElementSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedAnchor) return;
    const body = elementDraft.trim();
    if (!body) return;
    onAddElementComment(body, selectedAnchor);
    setElementDraft("");
    onClearSelection();
  }

  const selectedLabel =
    selectedAnchor?.editableLabel ??
    selectedAnchor?.editableId ??
    selectedAnchor?.editableType ??
    null;

  return (
    <aside className="lf-comments-col">
      <div className="lf-comments-header">
        <span className="lf-comments-title">Comments</span>
        <span className="lf-comments-count">{comments.length}</span>
      </div>

      {batchMeta?.linearUrl ? (
        <div className="lf-feedback-batch-status">
          <span className="lf-meta">Submitted: {batchMeta.linearIdentifier ?? "Linear issue"}</span>
          <a href={batchMeta.linearUrl} target="_blank" rel="noreferrer" className="lf-link">
            View in Linear
          </a>
        </div>
      ) : null}

      <div className="lf-comments-list">
        {sortedComments.length === 0 ? (
          <p className="lf-meta lf-comments-empty">
            No comments yet. Click any element on the page or leave page feedback below.
          </p>
        ) : (
          sortedComments.map((comment) => (
            <article key={comment.id} className="lf-comment-card">
              <div className="lf-comment-card-top">
                <span className="lf-comment-element-label">{commentDisplayLabel(comment)}</span>
                <button
                  type="button"
                  className="lf-comment-menu-btn"
                  aria-label="Comment options"
                  onClick={() => setMenuOpen(menuOpen === comment.id ? null : comment.id)}
                >
                  ···
                </button>
                {menuOpen === comment.id ? (
                  <div className="lf-comment-menu">
                    <button type="button" onClick={() => startEdit(comment)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="lf-text-red"
                      onClick={() => {
                        onDeleteComment(comment.id);
                        setMenuOpen(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>

              {editingId === comment.id ? (
                <div className="lf-comment-edit">
                  <textarea
                    className="lf-feedback-textarea"
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    rows={3}
                  />
                  <div className="lf-comment-edit-actions">
                    <button type="button" className="lf-btn lf-btn--outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                    <button type="button" className="lf-btn" onClick={() => saveEdit(comment.id)}>
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>{comment.body}</p>
                  <span className="lf-meta">
                    {comment.pagePath !== pagePath ? `${comment.pagePath} · ` : ""}
                    {formatCommentDate(comment.createdAt)}
                  </span>
                </>
              )}
            </article>
          ))
        )}
      </div>

      {selectedAnchor && selectedLabel ? (
        <form className="lf-page-feedback-composer" onSubmit={handleElementSubmit}>
          <div className="lf-page-feedback-composer-label">Comment on: {selectedLabel}</div>
          <textarea
            className="lf-feedback-textarea"
            placeholder="Describe the change…"
            value={elementDraft}
            onChange={(e) => setElementDraft(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="lf-page-feedback-composer-actions">
            <button type="button" className="lf-btn lf-btn--outline" onClick={onClearSelection}>
              Cancel
            </button>
            <button type="submit" className="lf-btn" disabled={!elementDraft.trim()}>
              Add comment
            </button>
          </div>
        </form>
      ) : null}

      <form className="lf-page-feedback-composer lf-page-feedback-composer--page" onSubmit={handlePageSubmit}>
        <div className="lf-page-feedback-composer-label">Leave feedback on {pageLabel}</div>
        <textarea
          className="lf-feedback-textarea"
          placeholder="Leave feedback on this page…"
          value={pageDraft}
          onChange={(e) => setPageDraft(e.target.value)}
          rows={3}
        />
        <div className="lf-page-feedback-composer-actions">
          <span className="lf-meta">Page comment</span>
          <button type="submit" className="lf-btn" disabled={!pageDraft.trim()}>
            Add
          </button>
        </div>
      </form>

      <div className="lf-feedback-submit-row">
        <button
          type="button"
          className="lf-btn lf-btn--primary"
          disabled={comments.length === 0 || submitting}
          onClick={onSubmitBatch}
        >
          {submitting ? "Submitting…" : "Submit to Linear"}
        </button>
      </div>
    </aside>
  );
}

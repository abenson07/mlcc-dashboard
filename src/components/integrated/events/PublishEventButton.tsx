"use client";

import { useState } from "react";

import { useEventContext } from "./EventContext";

export default function PublishEventButton() {
  const { event, publishEvent, unpublishEvent } = useEventContext();
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!event) return null;

  const isPublished = event.publishStatus === "published";

  async function handlePublish() {
    setSubmitting(true);
    try {
      await publishEvent();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnpublish() {
    setSubmitting(true);
    try {
      await unpublishEvent();
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="lf-hero-publish">
        <span
          className={
            isPublished
              ? "lf-event-status-tag lf-event-status-tag--published"
              : "lf-event-status-tag lf-event-status-tag--draft"
          }
        >
          {isPublished ? "Published" : "Draft"}
        </span>

        {isPublished ? (
          <button
            type="button"
            className="lf-btn lf-btn--outline"
            onClick={() => setConfirmOpen(true)}
            disabled={submitting}
          >
            Unpublish
          </button>
        ) : (
          <button
            type="button"
            className="lf-btn lf-btn--accent"
            onClick={() => void handlePublish()}
            disabled={submitting}
          >
            {submitting ? "Publishing…" : "Publish"}
          </button>
        )}
      </div>

      {confirmOpen && (
        <div
          className="lf-modal-overlay"
          onClick={submitting ? undefined : () => setConfirmOpen(false)}
        >
          <div
            className="lf-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="unpublish-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lf-modal-header">
              <span id="unpublish-modal-title" className="lf-modal-title">
                Unpublish event
              </span>
            </div>

            <div className="lf-modal-body">
              <p className="lf-meta">
                Unpublishing <strong style={{ color: "var(--lf-text)" }}>{event.title}</strong>{" "}
                removes it from the public site and reverts it to draft.
              </p>
            </div>

            <div className="lf-modal-footer">
              <button
                type="button"
                className="lf-link"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="lf-btn lf-btn--outline lf-text-red"
                onClick={() => void handleUnpublish()}
                disabled={submitting}
              >
                {submitting ? "Unpublishing…" : "Confirm unpublish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

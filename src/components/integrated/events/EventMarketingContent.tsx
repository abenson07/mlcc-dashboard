"use client";

import Link from "next/link";

import { useEventContext } from "./EventContext";

export default function EventMarketingContent() {
  const { loading, event } = useEventContext();

  if (loading && !event) {
    return <p className="lf-meta">Loading…</p>;
  }

  if (!event) {
    return (
      <div className="lf-empty-page">
        <h1 className="lf-h2">Event not found</h1>
        <Link href="/old-admin/events" className="lf-link">Back to events</Link>
      </div>
    );
  }

  const marketing = event.fieldData.marketing;

  return (
    <div>
      <div className="lf-page-header">
        <h1 className="lf-h1">Marketing</h1>
      </div>

      {event.publishStatus !== "published" ? (
        <p className="lf-page-desc" style={{ marginBottom: 20 }}>
          Publish this event to enable social post drafting and email workflows.
        </p>
      ) : marketing ? (
        <div className="lf-empty-page" style={{ padding: "24px 0", textAlign: "left" }}>
          <p className="lf-meta">Draft copy generated when this event was published:</p>
          <p><strong>{marketing.shortDescription}</strong></p>
          <p style={{ whiteSpace: "pre-wrap" }}>{marketing.body}</p>
          <Link href="/old-admin/communications" className="lf-link">
            Open Communications hub to schedule
          </Link>
        </div>
      ) : (
        <p className="lf-page-desc" style={{ marginBottom: 20 }}>
          This event is published, but draft copy generation failed or is still pending.
          Unpublish and republish to retry.
        </p>
      )}
    </div>
  );
}

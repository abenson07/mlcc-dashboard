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
        <Link href="/admin/events" className="lf-link">Back to events</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="lf-page-header">
        <h1 className="lf-h1">Marketing</h1>
      </div>
      <p className="lf-page-desc" style={{ marginBottom: 20 }}>
        Campaign linking by event is coming soon. Schedule marketing from the event marketing workflow when available.
      </p>
      <div className="lf-empty-page" style={{ padding: "24px 0" }}>
        <p className="lf-meta">No campaigns linked to this event yet.</p>
      </div>
    </div>
  );
}

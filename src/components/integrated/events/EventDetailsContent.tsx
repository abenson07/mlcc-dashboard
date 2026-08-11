"use client";

import Link from "next/link";
import { useState } from "react";
import { formatEventTimeRange } from "@/lib/events/eventData";
import { useEventContext } from "./EventContext";

export default function EventDetailsContent() {
  const { event, loading, readOnly, updateEvent } = useEventContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading && !event) {
    return <p className="lf-meta">Loading event…</p>;
  }

  if (!event) {
    return (
      <div className="lf-empty-page">
        <h1 className="lf-h2">Event not found</h1>
        <Link href="/old-admin/events" className="lf-link">Back to events</Link>
      </div>
    );
  }

  const fd = event.fieldData;
  const timeRange = formatEventTimeRange({
    id: event.id,
    name: event.title,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    date: null,
    event_template_id: event.event_template_id,
    slug: event.slug,
    committee: event.committee ?? null,
    field_data: fd,
    publish_status: event.publishStatus,
    created_at: "",
    updated_at: "",
  });

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (readOnly) return;
    const form = new FormData(e.currentTarget);
    setSaving(true);
    setError(null);
    try {
      await updateEvent({
        name: String(form.get("name") ?? "").trim(),
        field_data: {
          ...fd,
          location: String(form.get("location") ?? "").trim(),
          address: String(form.get("address") ?? "").trim(),
          capacity: Number(form.get("capacity")) || undefined,
          description: String(form.get("description") ?? "").trim(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="lf-form-stack" onSubmit={(e) => void handleSave(e)}>
      <div className="lf-page-header">
        <h1 className="lf-h1">Event details</h1>
        <button type="button" className="lf-small-btn">Go to event page ↗</button>
      </div>

      <p className="lf-nav-section" style={{ margin: "0 0 8px" }}>Details</p>

      <div className="lf-form-field">
        <label htmlFor="event-name">Event name</label>
        <span>Shown on the event page</span>
        <input id="event-name" name="name" defaultValue={event.title} disabled={readOnly} />
      </div>
      <div className="lf-form-field">
        <label htmlFor="event-date">Date</label>
        <span>Date of the event</span>
        <input id="event-date" defaultValue={event.distributionLabel} readOnly />
      </div>
      <div className="lf-form-field">
        <label htmlFor="event-time">Time</label>
        <span>Start and end time</span>
        <input id="event-time" defaultValue={timeRange} readOnly />
      </div>
      <div className="lf-form-field">
        <label htmlFor="event-location">Location</label>
        <span>General park name</span>
        <input id="event-location" name="location" defaultValue={fd.location ?? ""} disabled={readOnly} />
      </div>
      <div className="lf-form-field">
        <label htmlFor="event-address">Address</label>
        <span>Street address for maps</span>
        <input id="event-address" name="address" defaultValue={fd.address ?? ""} disabled={readOnly} />
      </div>
      <div className="lf-form-field">
        <label htmlFor="event-capacity">Capacity</label>
        <span>Maximum attendees</span>
        <input
          id="event-capacity"
          name="capacity"
          type="number"
          defaultValue={fd.capacity ?? ""}
          disabled={readOnly}
        />
      </div>

      <p className="lf-nav-section" style={{ margin: "16px 0 8px" }}>Description</p>
      <div className="lf-form-field">
        <textarea name="description" defaultValue={fd.description ?? ""} disabled={readOnly} />
      </div>

      <p className="lf-nav-section" style={{ margin: "16px 0 8px" }}>Event image</p>
      <div className="lf-event-image-row">
        {fd.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fd.image_url} alt="" className="lf-event-image-thumb" />
        ) : (
          <div className="lf-event-image-thumb" />
        )}
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Main image</div>
          <p className="lf-meta">Main image for the event page</p>
          <button type="button" className="lf-small-btn" disabled={readOnly}>
            Change image
          </button>
        </div>
      </div>

      {error && <p className="lf-text-red">{error}</p>}
      {!readOnly && (
        <button type="submit" className="lf-btn lf-btn--outline" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      )}
    </form>
  );
}

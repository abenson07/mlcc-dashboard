"use client";

import { getEventById } from "../mockData";

export default function EventDetailsContent({ eventId }: { eventId: string }) {
  const event = getEventById(eventId);

  return (
    <div className="lf-form-stack">
      <div className="lf-page-header">
        <h1 className="lf-h1">Event details</h1>
        <button type="button" className="lf-small-btn">Go to event page ↗</button>
      </div>

      <p className="lf-nav-section" style={{ margin: "0 0 8px" }}>Details</p>

      <div className="lf-form-field">
        <label htmlFor="event-name">Event name</label>
        <span>Shown on the event page</span>
        <input id="event-name" defaultValue={event.title} />
      </div>
      <div className="lf-form-field">
        <label htmlFor="event-date">Date</label>
        <span>Date of the event</span>
        <input id="event-date" defaultValue={event.distributionLabel} />
      </div>
      <div className="lf-form-field">
        <label htmlFor="event-time">Time</label>
        <span>Start and end time</span>
        <input id="event-time" defaultValue="12:00 pm – 4:00 pm" />
      </div>
      <div className="lf-form-field">
        <label htmlFor="event-location">Location</label>
        <span>General park name</span>
        <input id="event-location" defaultValue="Mooreland Park" />
      </div>
      <div className="lf-form-field">
        <label htmlFor="event-address">Address</label>
        <span>Street address for maps</span>
        <input id="event-address" defaultValue="1450 Oak Street" />
      </div>
      <div className="lf-form-field">
        <label htmlFor="event-capacity">Capacity</label>
        <span>Maximum attendees</span>
        <input id="event-capacity" defaultValue="500" />
      </div>

      <p className="lf-nav-section" style={{ margin: "16px 0 8px" }}>Description</p>
      <div className="lf-form-field">
        <textarea
          defaultValue="A neighborhood block party with live music, local food vendors, and family activities at Mooreland Park."
        />
      </div>

      <p className="lf-nav-section" style={{ margin: "16px 0 8px" }}>Event image</p>
      <div className="lf-event-image-row">
        <div className="lf-event-image-thumb" />
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Main image</div>
          <p className="lf-meta">Main image for the event page</p>
          <button type="button" className="lf-small-btn">Change image</button>
        </div>
      </div>
    </div>
  );
}

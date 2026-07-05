"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { COMMITTEE_LABELS } from "schemas/committee_meetings";
import { useCommitteeMeeting } from "hooks";
import { useEventContext } from "./EventContext";
import { combineLocalDateAndTime, splitIsoToLocalDateAndTime } from "@/lib/committee-meetings/meetingDateTime";
import MeetingLocationTypeTabs, {
  showMeetLink,
  showPhysicalLocation,
} from "../committee-meetings/MeetingLocationTypeTabs";
import LocationPlaceField from "../committee-meetings/LocationPlaceField";

export default function CommitteeMeetingDetailsContent() {
  const { eventId, event, loading: eventLoading, updateEvent } = useEventContext();
  const { meeting, loading: meetingLoading, patchMeeting } = useCommitteeMeeting(eventId);
  const [meetingDate, setMeetingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [meetUrl, setMeetUrl] = useState("");
  const [locationType, setLocationType] = useState<"in_person" | "remote" | "hybrid">("in_person");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!meeting || !event) return;
    const start = splitIsoToLocalDateAndTime(event.starts_at);
    const end = splitIsoToLocalDateAndTime(event.ends_at);
    setMeetingDate(start.date);
    setStartTime(start.time);
    setEndTime(end.time);
    setLocation(meeting.location ?? "");
    setMeetUrl(meeting.google_calendar_url ?? "");
    setLocationType(meeting.location_type);
  }, [meeting, event]);

  if ((eventLoading || meetingLoading) && !event) {
    return <p className="lf-meta">Loading…</p>;
  }

  if (!event || !meeting) {
    return (
      <div className="lf-empty-page">
        <h1 className="lf-h2">Meeting not found</h1>
        <Link href="/old-admin/events" className="lf-link">Back to events</Link>
      </div>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!meetingDate || !startTime) return;
    setSaving(true);
    try {
      const starts_at = combineLocalDateAndTime(meetingDate, startTime);
      const ends_at = endTime ? combineLocalDateAndTime(meetingDate, endTime) : null;

      await updateEvent({
        starts_at,
        ends_at,
        field_data: {
          ...event!.fieldData,
          location: showPhysicalLocation(locationType) ? location.trim() || undefined : undefined,
        },
      });

      await patchMeeting(meeting!.id, {
        location_type: locationType,
        location: showPhysicalLocation(locationType) ? location.trim() || null : null,
        google_calendar_url: showMeetLink(locationType) ? meetUrl.trim() || null : null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="lf-page-layout" style={{ maxWidth: 560 }}>
      <h1 className="lf-h1">Meeting details</h1>
      <p className="lf-page-desc">Schedule, location, and video link for this committee meeting.</p>

      <form onSubmit={handleSave} className="lf-overview-card" style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="lf-detail-row">
          <span className="lf-detail-label">Committee</span>
          <span>{COMMITTEE_LABELS[meeting.committee]}</span>
        </div>

        <div>
          <label className="lf-detail-label" htmlFor="md-date">Date</label>
          <input
            id="md-date"
            type="date"
            className="lf-input"
            style={{ width: "100%", marginTop: 6 }}
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="lf-detail-label" htmlFor="md-start">Start time</label>
            <input
              id="md-start"
              type="time"
              className="lf-input"
              style={{ width: "100%", marginTop: 6 }}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="lf-detail-label" htmlFor="md-end">End time</label>
            <input
              id="md-end"
              type="time"
              className="lf-input"
              style={{ width: "100%", marginTop: 6 }}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <span className="lf-detail-label">Meeting type</span>
          <div style={{ marginTop: 8 }}>
            <MeetingLocationTypeTabs value={locationType} onChange={setLocationType} id="md-location-type" />
          </div>
        </div>

        {showPhysicalLocation(locationType) && (
          <div>
            <label className="lf-detail-label" htmlFor="md-location">Location</label>
            <LocationPlaceField value={location} onChange={setLocation} />
          </div>
        )}

        {showMeetLink(locationType) && (
          <div>
            <label className="lf-detail-label" htmlFor="md-meet">Google Meet link</label>
            <input
              id="md-meet"
              className="lf-input"
              style={{ width: "100%", marginTop: 6 }}
              value={meetUrl}
              onChange={(e) => setMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/…"
            />
          </div>
        )}

        <button
          type="submit"
          className="lf-btn lf-btn--outline"
          disabled={saving || !meetingDate || !startTime}
        >
          {saving ? "Saving…" : "Save details"}
        </button>
      </form>
    </div>
  );
}

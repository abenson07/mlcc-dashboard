"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconCalendar } from "@/components/leaflet/icons";
import { COMMITTEE_LABELS } from "schemas/committee_meetings";
import { useCommitteeMeeting } from "hooks";
import { getApiBase } from "@/lib/apiBase";
import { useEventContext } from "./EventContext";
import AgendaEditor from "../committee-meetings/AgendaEditor";
import AttendancePanel from "../committee-meetings/AttendancePanel";
import ActionItemsTable from "../committee-meetings/ActionItemsTable";
import BulkActionItemsModal from "../committee-meetings/BulkActionItemsModal";
import { showMeetLink } from "../committee-meetings/MeetingLocationTypeTabs";

type CommitteeMeetingOverviewContentProps = {
  /** When true, the "In attendance" panel lives in the shell widget sidepanel instead of this page's aside. */
  embedded?: boolean;
};

export default function CommitteeMeetingOverviewContent({
  embedded = false,
}: CommitteeMeetingOverviewContentProps) {
  const { eventId, event, loading: eventLoading, error: eventError } = useEventContext();
  const {
    meeting,
    loading: meetingLoading,
    error: meetingError,
    patchMeeting,
    setAttendees,
    submitMinutes,
    refetch,
  } = useCommitteeMeeting(eventId);

  const [transcript, setTranscript] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const agendaSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seededAttendeesRef = useRef(false);

  useEffect(() => {
    if (meeting?.raw_transcript != null) {
      setTranscript(meeting.raw_transcript);
    }
  }, [meeting?.raw_transcript]);

  useEffect(() => {
    if (!meeting || seededAttendeesRef.current) return;
    if (meeting.attendees.length > 0) {
      seededAttendeesRef.current = true;
      return;
    }

    seededAttendeesRef.current = true;
    void (async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/committee-meetings/${encodeURIComponent(meeting.id)}/attendees/seed-default`, {
          method: "POST",
        });
        if (res.ok) await refetch();
      } catch {
        seededAttendeesRef.current = false;
      }
    })();
  }, [meeting, refetch]);

  const minutesEditable = meeting?.minutes_status === "draft" || meeting?.minutes_status === "error";
  const minutesProcessing = meeting?.minutes_status === "processing";
  const minutesReady =
    meeting?.minutes_status === "ready" || meeting?.minutes_status === "submitted";

  const handleAgendaChange = useCallback(
    (json: Record<string, unknown>) => {
      if (!meeting) return;
      if (agendaSaveTimer.current) clearTimeout(agendaSaveTimer.current);
      agendaSaveTimer.current = setTimeout(() => {
        void patchMeeting(meeting.id, { agenda_json: json });
      }, 800);
    },
    [meeting, patchMeeting],
  );

  const handleTranscriptBlur = useCallback(() => {
    if (!meeting || !minutesEditable) return;
    void patchMeeting(meeting.id, { raw_transcript: transcript });
  }, [meeting, minutesEditable, patchMeeting, transcript]);

  const handleAttendeesChange = useCallback(
    (personIds: string[]) => {
      if (!meeting) return;
      void setAttendees(meeting.id, personIds);
    },
    [meeting, setAttendees],
  );

  async function handleSubmitMinutes() {
    if (!meeting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await patchMeeting(meeting.id, { raw_transcript: transcript });
      await submitMinutes(meeting.id);
      await refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  if ((eventLoading || meetingLoading) && !event) {
    return <p className="lf-meta">Loading meeting…</p>;
  }

  if (eventError || meetingError) {
    return <p className="lf-text-red">{eventError ?? meetingError}</p>;
  }

  if (!event || !meeting) {
    return (
      <div className="lf-empty-page">
        <h1 className="lf-h2">Meeting not found</h1>
        <Link href="/old-admin/events" className="lf-link">Back to events</Link>
      </div>
    );
  }

  const committeeLabel = COMMITTEE_LABELS[meeting.committee] ?? meeting.committee;

  return (
    <div className="lf-overview-layout">
      <div className="lf-overview-main">
        <div className="lf-hero">
          <h1 className="lf-h1">{committeeLabel} meeting</h1>
          <div className="lf-hero-meta">
            <span className="lf-meta lf-committee-badge">{committeeLabel}</span>
            <span className="lf-hero-date">
              <IconCalendar />
              {event.distributionLabel}
            </span>
          </div>
        </div>

        <section className="lf-overview-card">
          <div className="lf-overview-card-header">
            <span className="lf-overview-card-title">Agenda</span>
            <span className="lf-meta">Autosaves as you type</span>
          </div>
          <AgendaEditor
            content={meeting.agenda_json}
            onChange={handleAgendaChange}
            disabled={false}
          />
        </section>

        <section className="lf-overview-card">
          <div className="lf-overview-card-header">
            <span className="lf-overview-card-title">Meeting minutes</span>
            {minutesProcessing && <span className="lf-meta">Analyzing…</span>}
            {minutesReady && <span className="lf-meta">Submitted</span>}
          </div>

          {minutesEditable ? (
            <>
              <textarea
                className="lf-textarea"
                rows={12}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                onBlur={handleTranscriptBlur}
                placeholder="Paste or type meeting notes / transcript here…"
              />
              <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  type="button"
                  className="lf-btn lf-btn--primary"
                  disabled={submitting || !transcript.trim()}
                  onClick={() => void handleSubmitMinutes()}
                >
                  {submitting ? "Submitting…" : meeting.minutes_status === "error" ? "Retry submit" : "Submit"}
                </button>
                {submitError && <span className="lf-text-red">{submitError}</span>}
                {meeting.minutes_error && (
                  <span className="lf-text-red">{meeting.minutes_error}</span>
                )}
              </div>
            </>
          ) : minutesProcessing ? (
            <p className="lf-meta">Processing transcript and extracting action items…</p>
          ) : (
            <div className="lf-minutes-readonly">{transcript || meeting.raw_transcript}</div>
          )}
        </section>

        {(minutesReady || meeting.action_items.length > 0) && (
          <section className="lf-overview-card">
            <div className="lf-overview-card-header">
              <span className="lf-overview-card-title">Action items</span>
              <button
                type="button"
                className="lf-btn lf-btn--ghost lf-btn--sm"
                onClick={() => setBulkOpen(true)}
              >
                Bulk import
              </button>
            </div>
            <ActionItemsTable items={meeting.action_items} onUpdated={() => void refetch()} />
          </section>
        )}
      </div>

      <aside className="lf-overview-aside">
        {!embedded && (
          <AttendancePanel
            attendees={meeting.attendees}
            onChange={handleAttendeesChange}
          />
        )}
        {showMeetLink(meeting.location_type) && meeting.google_calendar_url && (
          <section className="lf-overview-card">
            <div className="lf-overview-card-header">
              <span className="lf-overview-card-title">Google Meet</span>
            </div>
            <a
              href={meeting.google_calendar_url}
              target="_blank"
              rel="noopener noreferrer"
              className="lf-link"
            >
              Join video call
            </a>
          </section>
        )}
      </aside>

      <BulkActionItemsModal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        committeeMeetingId={meeting.id}
        onImported={() => void refetch()}
      />
    </div>
  );
}

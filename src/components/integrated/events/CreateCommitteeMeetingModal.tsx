"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";
import type { CreateCommitteeMeetingPayload } from "hooks";
import { combineLocalDateAndTime } from "@/lib/committee-meetings/meetingDateTime";
import MeetingLocationTypeTabs, {
  showMeetLink,
  showPhysicalLocation,
} from "../committee-meetings/MeetingLocationTypeTabs";
import LocationPlaceField from "../committee-meetings/LocationPlaceField";

const COMMITTEES = Object.keys(COMMITTEE_LABELS) as CommitteeSlug[];

type CreateCommitteeMeetingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateCommitteeMeetingPayload) => Promise<void>;
};

export default function CreateCommitteeMeetingModal({
  isOpen,
  onClose,
  onCreate,
}: CreateCommitteeMeetingModalProps) {
  const [committee, setCommittee] = useState<CommitteeSlug>("steering");
  const [meetingDate, setMeetingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [locationType, setLocationType] = useState<"in_person" | "remote" | "hybrid">("in_person");
  const [location, setLocation] = useState("");
  const [meetUrl, setMeetUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!meetingDate || !startTime) return;
    setSaving(true);
    setError(null);
    try {
      const starts_at = combineLocalDateAndTime(meetingDate, startTime);
      const ends_at = endTime ? combineLocalDateAndTime(meetingDate, endTime) : null;

      await onCreate({
        committee,
        starts_at,
        ends_at,
        location_type: locationType,
        location: showPhysicalLocation(locationType) ? location.trim() || null : null,
        google_calendar_url: showMeetLink(locationType) ? meetUrl.trim() || null : null,
      });
      setMeetingDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setMeetUrl("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create meeting");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h2 className="lf-h2" style={{ fontSize: 18 }}>New committee meeting</h2>
      <p className="lf-page-desc">Creates a meeting in the events list with agenda and minutes tools.</p>
      <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <Label htmlFor="cm-committee">Committee</Label>
          <select
            id="cm-committee"
            className="lf-select"
            style={{ width: "100%" }}
            value={committee}
            onChange={(e) => setCommittee(e.target.value as CommitteeSlug)}
          >
            {COMMITTEES.map((slug) => (
              <option key={slug} value={slug}>
                {COMMITTEE_LABELS[slug]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="cm-date">Date</Label>
          <Input
            id="cm-date"
            type="date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <Label htmlFor="cm-start">Start time</Label>
            <Input
              id="cm-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cm-end">End time (optional)</Label>
            <Input
              id="cm-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Meeting type</Label>
          <div style={{ marginTop: 8 }}>
            <MeetingLocationTypeTabs value={locationType} onChange={setLocationType} />
          </div>
        </div>

        {showPhysicalLocation(locationType) && (
          <div>
            <Label htmlFor="cm-location">Location</Label>
            <LocationPlaceField
              value={location}
              onChange={setLocation}
              placeholder="Search for an address…"
            />
          </div>
        )}

        {showMeetLink(locationType) && (
          <div>
            <Label htmlFor="cm-meet">Google Meet link (optional)</Label>
            <Input
              id="cm-meet"
              value={meetUrl}
              onChange={(e) => setMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/…"
            />
          </div>
        )}

        {error && <p className="lf-text-red">{error}</p>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !meetingDate || !startTime}>
            {saving ? "Creating…" : "Create meeting"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

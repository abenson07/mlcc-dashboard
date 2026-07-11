"use client";

import { useMemo, useState } from "react";
import { usePeople } from "hooks";
import type { MeetingAttendee } from "hooks/useCommitteeMeeting";
import { IconPlus } from "@/components/leaflet/icons";

type AttendanceFieldsProps = {
  attendees: MeetingAttendee[];
  onChange: (personIds: string[]) => void;
  disabled?: boolean;
};

/** Attendee list + add/remove search, with no outer card wrapper — reused by AttendancePanel (lf-overview-card) and AttendanceWidget (shell widget panel). */
export function AttendanceFields({
  attendees,
  onChange,
  disabled = false,
}: AttendanceFieldsProps) {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);

  const attendeePersonIds = useMemo(
    () => new Set(attendees.map((a) => a.person_id).filter(Boolean)),
    [attendees],
  );

  const { people: searchResults, loading: searchLoading } = usePeople({
    autoFetch: adding && search.trim().length > 0,
    filters: { search: search.trim() || undefined },
  });

  const candidates = useMemo(
    () => searchResults.filter((p) => !attendeePersonIds.has(p.id)).slice(0, 12),
    [searchResults, attendeePersonIds],
  );

  function removePerson(personId: string) {
    if (disabled) return;
    onChange(attendees.map((a) => a.person_id).filter((id) => id !== personId));
  }

  function addPerson(personId: string) {
    if (disabled || attendeePersonIds.has(personId)) return;
    onChange([...attendees.map((a) => a.person_id), personId]);
    setSearch("");
  }

  return (
    <>
      {attendees.length === 0 && (
        <p className="lf-meta">
          No attendees yet. Defaults come from Settings → Committee, or search to add others.
        </p>
      )}

      {attendees.map((attendee) => (
        <label key={attendee.id} className="lf-task-box">
          <input
            type="checkbox"
            checked
            disabled={disabled}
            onChange={() => removePerson(attendee.person_id)}
          />
          <span>{attendee.person?.full_name ?? "Unknown person"}</span>
        </label>
      ))}

      {!disabled && (
        <>
          {!adding ? (
            <button
              type="button"
              className="lf-btn lf-btn--ghost lf-btn--sm"
              onClick={() => setAdding(true)}
            >
              <IconPlus />
              Add person
            </button>
          ) : (
            <div style={{ marginTop: 8 }}>
              <input
                type="search"
                className="lf-input"
                placeholder="Search anyone in people…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {search.trim().length === 0 && (
                  <span className="lf-meta">Type a name or email to search</span>
                )}
                {searchLoading && search.trim() && (
                  <span className="lf-meta">Searching…</span>
                )}
                {candidates.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="lf-mention-item"
                    style={{ textAlign: "left" }}
                    onClick={() => addPerson(p.id)}
                  >
                    {p.full_name}
                    {p.email ? <span className="lf-meta"> · {p.email}</span> : null}
                  </button>
                ))}
                {search.trim() && !searchLoading && candidates.length === 0 && (
                  <span className="lf-meta">No matching people</span>
                )}
              </div>
              <button
                type="button"
                className="lf-btn lf-btn--ghost lf-btn--sm"
                style={{ marginTop: 8 }}
                onClick={() => {
                  setAdding(false);
                  setSearch("");
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

type AttendancePanelProps = AttendanceFieldsProps;

/** Card-styled attendance panel for the old-admin (non-shell) events aside. */
export default function AttendancePanel(props: AttendancePanelProps) {
  return (
    <section className="lf-overview-card">
      <div className="lf-overview-card-header">
        <span className="lf-overview-card-title">In attendance</span>
        <span className="lf-meta">{props.attendees.length} people</span>
      </div>
      <AttendanceFields {...props} />
    </section>
  );
}

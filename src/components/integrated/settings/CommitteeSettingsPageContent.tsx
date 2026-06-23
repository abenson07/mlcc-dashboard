"use client";

import { useMemo, useState } from "react";
import { usePeople, useCommitteeDefaultAttendees } from "hooks";
import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";
import { IconPlus } from "@/components/leaflet/icons";
import SettingsPageShell from "./SettingsPageShell";

const COMMITTEES = Object.keys(COMMITTEE_LABELS) as CommitteeSlug[];

function CommitteeDefaultAttendeesSection({ committee }: { committee: CommitteeSlug }) {
  const { attendees, loading, error, save } = useCommitteeDefaultAttendees(committee);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const attendeeIds = useMemo(() => new Set(attendees.map((a) => a.person_id)), [attendees]);

  const { people: searchResults, loading: searchLoading } = usePeople({
    autoFetch: adding && search.trim().length > 0,
    filters: { search: search.trim() || undefined },
  });

  const candidates = useMemo(
    () => searchResults.filter((p) => !attendeeIds.has(p.id)).slice(0, 12),
    [searchResults, attendeeIds],
  );

  async function persist(personIds: string[]) {
    setSaving(true);
    setSaveError(null);
    try {
      await save(personIds);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function removePerson(personId: string) {
    void persist(attendees.map((a) => a.person_id).filter((id) => id !== personId));
  }

  function addPerson(personId: string) {
    void persist([...attendees.map((a) => a.person_id), personId]);
    setSearch("");
    setAdding(false);
  }

  return (
    <section className="lf-overview-card">
      <div className="lf-overview-card-header">
        <span className="lf-overview-card-title">{COMMITTEE_LABELS[committee]}</span>
        <span className="lf-meta">{attendees.length} people</span>
      </div>

      {loading && <p className="lf-meta">Loading…</p>}
      {error && <p className="lf-text-red">{error}</p>}
      {saveError && <p className="lf-text-red">{saveError}</p>}

      {!loading && attendees.length === 0 && (
        <p className="lf-meta">No defaults yet. Add people who should attend {COMMITTEE_LABELS[committee]} meetings by default.</p>
      )}

      {attendees.map((attendee) => (
        <label key={attendee.id} className="lf-task-box">
          <input
            type="checkbox"
            checked
            disabled={saving}
            onChange={() => removePerson(attendee.person_id)}
          />
          <span>
            {attendee.person?.full_name ?? "Unknown person"}
            {attendee.person?.email ? (
              <span className="lf-meta"> · {attendee.person.email}</span>
            ) : null}
          </span>
        </label>
      ))}

      {!adding ? (
        <button
          type="button"
          className="lf-btn lf-btn--ghost lf-btn--sm"
          disabled={saving}
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
            placeholder="Search people…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {search.trim().length === 0 && (
              <span className="lf-meta">Type a name or email to search</span>
            )}
            {searchLoading && search.trim() && <span className="lf-meta">Searching…</span>}
            {candidates.map((p) => (
              <button
                key={p.id}
                type="button"
                className="lf-mention-item"
                style={{ textAlign: "left" }}
                disabled={saving}
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
    </section>
  );
}

export default function CommitteeSettingsPageContent() {
  return (
    <SettingsPageShell
      title="Committee settings"
      description="Set default attendees for each committee. They are added automatically when you create a new meeting for that committee."
    >
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>
        {COMMITTEES.map((slug) => (
          <CommitteeDefaultAttendeesSection key={slug} committee={slug} />
        ))}
      </div>
    </SettingsPageShell>
  );
}

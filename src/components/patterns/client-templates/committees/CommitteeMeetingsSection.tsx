"use client";

import { Badge } from "@/components/patterns/primitives/Badge";
import { Text } from "@/components/patterns/primitives/Text";
import { sampleCommitteeMeetings, type CommitteeMeetingRow } from "@/data/mocks/committees";

export type CommitteeMeetingsSectionProps = {
  onSelectMeeting?: (row: CommitteeMeetingRow) => void;
};

/**
 * Meetings list for the committee Overview page — date / topic / status,
 * matching the boxed shape of `CommitteeMembersSection` for a side-by-side
 * layout.
 */
export function CommitteeMeetingsSection({ onSelectMeeting }: CommitteeMeetingsSectionProps) {
  const meetings = sampleCommitteeMeetings;
  const upcomingCount = meetings.filter((m) => m.status === "Upcoming").length;

  return (
    <section
      data-slot="committee-meetings-section"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 20,
        background: "var(--linear-color-panel)",
        border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-md)",
        boxShadow: "var(--linear-shadow-panel)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Text weight="semibold">Meetings</Text>
        <Text size="sm" color="secondary">
          {upcomingCount} upcoming
        </Text>
      </div>

      {meetings.length === 0 ? (
        <Text size="sm" color="secondary">
          No meetings scheduled yet.
        </Text>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {meetings.map((meeting) => (
            <button
              key={meeting.id}
              type="button"
              onClick={() => onSelectMeeting?.(meeting)}
              style={{
                all: "unset",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 4px",
                borderRadius: "var(--linear-radius-sm)",
                cursor: onSelectMeeting ? "pointer" : "default",
              }}
            >
              <Text size="sm" color="secondary" style={{ width: 84, flexShrink: 0 }}>
                {meeting.date}
              </Text>
              <Text size="sm" style={{ flex: 1, minWidth: 0 }}>
                {meeting.topic}
              </Text>
              <Badge label={meeting.status} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

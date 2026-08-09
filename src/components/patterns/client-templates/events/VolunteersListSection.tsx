"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Text } from "@/components/patterns/primitives/Text";
import { sampleEventVolunteers, type EventVolunteerRow } from "@/data/mocks/events";

export type VolunteersListSectionProps = {
  onSelectVolunteer?: (row: EventVolunteerRow) => void;
  onSeeAllVolunteers?: () => void;
};

const STATUS_COLOR: Record<EventVolunteerRow["status"], string> = {
  Confirmed: "#27a644",
  Invited: "#f2c94c",
  Declined: "#8a8f98",
};

const PREVIEW_LIMIT = 5;

/**
 * Short volunteers preview for the Overview page — a plain Name / Role /
 * Status list (not the grouped table), matching the boxed shape of
 * `EventTasksSection` for a side-by-side layout.
 */
export function VolunteersListSection({ onSelectVolunteer, onSeeAllVolunteers }: VolunteersListSectionProps) {
  const volunteers = sampleEventVolunteers;
  const preview = volunteers.slice(0, PREVIEW_LIMIT);
  const confirmedCount = volunteers.filter((v) => v.status === "Confirmed").length;

  return (
    <section
      data-slot="volunteers-list-section"
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
        <Text weight="semibold">Volunteers</Text>
        <Text size="sm" color="secondary">
          {confirmedCount} confirmed
        </Text>
      </div>

      {preview.length === 0 ? (
        <Text size="sm" color="secondary">
          No volunteers signed up yet.
        </Text>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {preview.map((volunteer) => (
            <button
              key={volunteer.id}
              type="button"
              onClick={() => onSelectVolunteer?.(volunteer)}
              style={{
                all: "unset",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 4px",
                borderRadius: "var(--linear-radius-sm)",
                cursor: onSelectVolunteer ? "pointer" : "default",
              }}
            >
              <Avatar name={volunteer.name} size="sm" />
              <Text size="sm" style={{ flex: 1, minWidth: 0 }}>
                {volunteer.name}
              </Text>
              <Text size="sm" color="secondary">
                {volunteer.role}
              </Text>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                  width: 84,
                  justifyContent: "flex-end",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: STATUS_COLOR[volunteer.status],
                    flexShrink: 0,
                  }}
                />
                <Text size="sm" color="secondary">
                  {volunteer.status}
                </Text>
              </span>
            </button>
          ))}
        </div>
      )}

      {onSeeAllVolunteers ? (
        <button
          type="button"
          onClick={onSeeAllVolunteers}
          style={{
            all: "unset",
            cursor: "pointer",
            marginTop: 8,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--linear-color-accent)",
          }}
        >
          See all volunteers
        </button>
      ) : null}
    </section>
  );
}

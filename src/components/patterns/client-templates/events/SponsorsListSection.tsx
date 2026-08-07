"use client";

import { Text } from "@/components/patterns/primitives/Text";
import { sampleEventSponsors, type EventSponsorRow } from "@/data/mocks/events";

export type SponsorsListSectionProps = {
  onSelectSponsor?: (row: EventSponsorRow) => void;
};

const STATUS_COLOR: Record<EventSponsorRow["status"], string> = {
  Confirmed: "#27a644",
  Pending: "#f2c94c",
  Declined: "#8a8f98",
};

/**
 * Sponsors and their commitment status — boxed to match `EventTasksSection`
 * / `VolunteersListSection` for the Overview's final two-column row.
 */
export function SponsorsListSection({ onSelectSponsor }: SponsorsListSectionProps) {
  const sponsors = sampleEventSponsors;
  const confirmedCount = sponsors.filter((s) => s.status === "Confirmed").length;

  return (
    <section
      data-slot="sponsors-list-section"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 20,
        border: "var(--linear-border-width) solid var(--linear-color-hairline)",
        borderRadius: "var(--linear-radius-md)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Text weight="semibold">Sponsors</Text>
        <Text size="sm" color="secondary">
          {confirmedCount} confirmed
        </Text>
      </div>

      {sponsors.length === 0 ? (
        <Text size="sm" color="secondary">
          No sponsors yet.
        </Text>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sponsors.map((sponsor) => (
            <button
              key={sponsor.id}
              type="button"
              onClick={() => onSelectSponsor?.(sponsor)}
              style={{
                all: "unset",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 4px",
                borderRadius: "var(--linear-radius-sm)",
                cursor: onSelectSponsor ? "pointer" : "default",
              }}
            >
              <Text size="sm" style={{ flex: 1, minWidth: 0 }}>
                {sponsor.name}
              </Text>
              <Text size="sm" color="secondary">
                {sponsor.tier}
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
                    background: STATUS_COLOR[sponsor.status],
                    flexShrink: 0,
                  }}
                />
                <Text size="sm" color="secondary">
                  {sponsor.status}
                </Text>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

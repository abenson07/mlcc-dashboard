"use client";

import { Text } from "@/components/patterns/primitives/Text";
import { eventMocksFor } from "@/data/mocks/events";

const sampleEventSponsorshipLevels = eventMocksFor("evt-movies-tower").sponsorshipLevels;

/**
 * Compact list of sponsorship levels and how many of each are filled —
 * sits alongside `BudgetChart` in the Sponsorships page's top grid.
 */
export function SponsorshipLevelsPanel() {
  const levels = sampleEventSponsorshipLevels;

  return (
    <section
      data-slot="sponsorship-levels-panel"
      style={{
        boxSizing: "border-box",
        height: "100%",
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
      <Text weight="semibold" style={{ marginBottom: 8 }}>
        Sponsorship levels
      </Text>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {levels.map((level) => (
          <div key={level.id} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <Text size="sm">{level.name}</Text>
              <Text size="sm" color="secondary">
                {level.quantityFilled}/{level.quantityAvailable}
              </Text>
            </div>
            <Text size="sm" color="secondary">
              {level.price}
            </Text>
          </div>
        ))}
      </div>
    </section>
  );
}

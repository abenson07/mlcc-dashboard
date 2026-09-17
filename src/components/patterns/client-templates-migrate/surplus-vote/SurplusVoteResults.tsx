"use client";

import { Text } from "@/components/patterns/primitives/Text";
import { formatSurplusPrice, SURPLUS_VOTE_ITEM_COUNT } from "@/lib/surplus-vote/items";
import type { SurplusVoteResult } from "@/lib/surplus-vote/score";

export type SurplusVoteResultsProps = {
  results: SurplusVoteResult[];
  ballotCount: number;
};

export function SurplusVoteResults({ results, ballotCount }: SurplusVoteResultsProps) {
  const maxPoints = Math.max(1, ...results.map((row) => row.points));
  const peopleLabel =
    ballotCount === 1 ? "1 person has ranked" : `${ballotCount} people have ranked`;

  return (
    <section
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 20,
        maxWidth: 720,
        marginInline: "auto",
        background: "var(--linear-color-panel)",
        border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-md)",
        boxShadow: "var(--linear-shadow-panel)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Text weight="semibold">Results</Text>
        <Text size="sm" color="secondary">
          {peopleLabel}. Higher rank earns more points (1st of {SURPLUS_VOTE_ITEM_COUNT} ={" "}
          {SURPLUS_VOTE_ITEM_COUNT} points).
        </Text>
      </div>

      {ballotCount === 0 ? (
        <Text size="sm" color="secondary">
          No rankings yet.
        </Text>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {results.map((row, index) => {
            const pct = (row.points / maxPoints) * 100;
            return (
              <div
                key={row.id}
                style={{ display: "flex", flexDirection: "column", gap: 6 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <Text weight="medium">
                        {index + 1}. {row.title}
                      </Text>
                      {row.priceDollars != null ? (
                        <Text size="sm" color="secondary">
                          {formatSurplusPrice(row.priceDollars)}
                        </Text>
                      ) : null}
                    </div>
                    <Text size="sm" color="secondary" display="block">
                      {row.description}
                    </Text>
                  </div>
                  <Text size="sm" weight="medium" style={{ flexShrink: 0 }}>
                    {row.points}
                  </Text>
                </div>
                <div
                  role="img"
                  aria-label={`${row.points} points for ${row.title}`}
                  style={{
                    height: 10,
                    borderRadius: 999,
                    overflow: "hidden",
                    background: "var(--linear-color-sidebar-item-selected)",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      width: `${pct}%`,
                      height: "100%",
                      background: "#5e6ad2",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

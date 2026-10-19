"use client";

import { Text } from "@/components/patterns/primitives/Text";
import { formatSurplusPrice } from "@/lib/surplus-vote/items";
import { ordinal, type SurplusVoteResult } from "@/lib/surplus-vote/score";

export type SurplusVoteResultsProps = {
  results: SurplusVoteResult[];
  ballotCount: number;
};

export function SurplusVoteResults({ results, ballotCount }: SurplusVoteResultsProps) {
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
          {peopleLabel}. Ideas are ordered by total points across all ballots.
        </Text>
      </div>

      {ballotCount === 0 ? (
        <Text size="sm" color="secondary">
          No rankings yet.
        </Text>
      ) : (
        <ol
          aria-label="Surplus vote results"
          style={{ display: "flex", flexDirection: "column", gap: 16, margin: 0, padding: 0 }}
        >
          {results.map((row) => (
            <li key={row.id} style={{ listStyle: "none", display: "flex", gap: 12 }}>
              <span
                aria-hidden
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  borderRadius: 8,
                  background: "var(--linear-color-sidebar-item-selected)",
                  color: "var(--linear-color-ink)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {row.rank}
              </span>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}
                >
                  <Text weight="medium">{row.title}</Text>
                  {row.priceDollars != null ? (
                    <Text size="sm" color="secondary">
                      {formatSurplusPrice(row.priceDollars)}
                    </Text>
                  ) : null}
                  {row.tied ? (
                    <span
                      style={{
                        padding: "1px 8px",
                        borderRadius: 999,
                        background: "var(--linear-color-sidebar-item-selected)",
                        color: "var(--linear-color-ink)",
                        fontSize: 12,
                        fontWeight: 500,
                        lineHeight: "18px",
                      }}
                    >
                      Tied for {ordinal(row.rank)}
                    </span>
                  ) : null}
                </div>
                <Text size="sm" color="secondary" display="block">
                  {row.description}
                </Text>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

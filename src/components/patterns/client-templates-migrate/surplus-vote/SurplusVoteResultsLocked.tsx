"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";

export function SurplusVoteResultsLocked({ onVote }: { onVote: () => void }) {
  return (
    <section style={{ maxWidth: 680, width: "100%", marginInline: "auto" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          padding: "32px 24px",
          textAlign: "center",
          background: "var(--linear-color-panel)",
          border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
          borderRadius: "var(--linear-radius-md)",
        }}
      >
        <Lock
          size={28}
          strokeWidth={1.75}
          aria-hidden
          style={{ color: "var(--linear-color-ink-subtle)" }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Text weight="semibold">Vote to see the results</Text>
          <Text size="sm" color="secondary">
            Results unlock once you&apos;ve submitted your own ranking.
          </Text>
        </div>
        <Button label="Go to vote" variant="primary" onClick={onVote} />
      </div>
    </section>
  );
}

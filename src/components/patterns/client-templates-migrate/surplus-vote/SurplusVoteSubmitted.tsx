"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";

type SurplusVoteSubmittedProps = {
  onReset: () => void;
  onViewResults: () => void;
  resetting: boolean;
};

export function SurplusVoteSubmitted({
  onReset,
  onViewResults,
  resetting,
}: SurplusVoteSubmittedProps) {
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
        <CheckCircle2
          size={28}
          strokeWidth={1.75}
          aria-hidden
          style={{ color: "var(--linear-color-ink-subtle)" }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Text weight="semibold">Your vote has been submitted</Text>
          <Text size="sm" color="secondary">
            Thanks for ranking surplus spending. Want to change it? Reset your vote to rank the
            cards again.
          </Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Button
            label={resetting ? "Resetting…" : "Reset my vote"}
            variant="secondary"
            disabled={resetting}
            onClick={onReset}
          />
          <Button label="See results" variant="primary" onClick={onViewResults} />
        </div>
      </div>
    </section>
  );
}

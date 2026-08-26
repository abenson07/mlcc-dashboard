"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useDemoGuard } from "hooks";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { getApiBase } from "@/lib/apiBase";
import { isUnconfirmedOnlyStep } from "@/lib/leaflets/comm/commSchedule";
import type { CommStage } from "@/components/leaflet/types";

export type LeafletCommStepsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  leafletId: string;
  leafletTitle: string;
  stages: CommStage[];
  recipientCount: number;
  onSent?: (stepKey: string) => void | Promise<void>;
};

function statsLabel(stage: CommStage): string {
  if (stage.yes != null) {
    const parts = [`${stage.yes} confirmed`];
    if (stage.unresponsive != null) parts.push(`${stage.unresponsive} unresponsive`);
    if (stage.no != null && stage.no > 0) parts.push(`${stage.no} declined`);
    return parts.join(" · ");
  }
  if (stage.sentCount != null) {
    return `${stage.sentCount} sent`;
  }
  return stage.sentDate ?? "Sent";
}

export function LeafletCommStepsModal({
  isOpen,
  onClose,
  leafletId,
  leafletTitle,
  stages,
  recipientCount,
  onSent,
}: LeafletCommStepsModalProps) {
  const { enabled: demo, sendDemoEmail } = useDemoGuard();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeStage = stages.find((s) => s.state === "active");

  async function handleConfirm() {
    if (!activeStage?.stepKey || sending) return;
    setSending(true);
    setError(null);
    try {
      if (demo) {
        await sendDemoEmail({
          subject: `${activeStage.name} — ${leafletTitle}`,
          text: `Demo send of "${activeStage.name}" for ${leafletTitle}.`,
          context: `${recipientCount} deliverer${recipientCount === 1 ? "" : "s"}`,
        });
        await onSent?.(activeStage.stepKey);
        return;
      }
      const res = await fetch(
        `${getApiBase()}/api/leaflets/${encodeURIComponent(leafletId)}/comm/${encodeURIComponent(activeStage.stepKey)}/send`,
        { method: "POST" },
      );
      const data = (await res.json()) as { error?: string; sent?: number };
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      toast.success(`Sent ${data.sent ?? 0} email${(data.sent ?? 0) === 1 ? "" : "s"}`);
      await onSent?.(activeStage.stepKey);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deliverer emails"
      width={520}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancel" variant="ghost" onClick={onClose} />
          <Button
            label={sending ? "Sending…" : "Confirm"}
            variant="primary"
            disabled={!activeStage || sending}
            onClick={() => {
              void handleConfirm();
            }}
          />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Text size="sm" color="secondary">
          {activeStage
            ? isUnconfirmedOnlyStep(activeStage.stepKey ?? "")
              ? `Confirm sends “${activeStage.name}” to ${recipientCount} deliverer${recipientCount === 1 ? "" : "s"} who have not confirmed.`
              : `Confirm sends “${activeStage.name}” to ${recipientCount} deliverer${recipientCount === 1 ? "" : "s"}.`
            : "All deliverer emails for this leaflet have been sent."}
        </Text>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {stages.map((stage) => {
            const isActive = stage.state === "active";
            return (
              <div
                key={stage.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: isActive
                    ? "var(--linear-border-width) solid var(--linear-color-accent)"
                    : "var(--linear-border-width) solid var(--linear-color-hairline)",
                  background: isActive
                    ? "color-mix(in srgb, var(--linear-color-accent) 10%, var(--linear-color-panel))"
                    : "var(--linear-color-panel)",
                  opacity: stage.state === "upcoming" ? 0.72 : 1,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <Text weight={isActive ? "semibold" : "medium"}>{stage.name}</Text>
                  {stage.state === "completed" ? (
                    <Text size="sm" color="secondary">
                      {statsLabel(stage)}
                    </Text>
                  ) : null}
                </div>
                <Text
                  size="sm"
                  weight={isActive ? "semibold" : undefined}
                  color={isActive ? undefined : "secondary"}
                  style={{ flexShrink: 0, textAlign: "right" }}
                >
                  {stage.state === "active"
                    ? "Ready to send"
                    : stage.state === "upcoming"
                      ? (stage.timing ?? "Upcoming")
                      : (stage.timing ?? "Sent")}
                </Text>
              </div>
            );
          })}
        </div>
        {error ? (
          <Text size="sm" color="secondary">
            {error}
          </Text>
        ) : null}
      </div>
    </Modal>
  );
}

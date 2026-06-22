"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { CommStage } from "../types";
import SendConfirmationModal from "./SendConfirmationModal";

type CommunicationPanelProps = {
  stages: CommStage[];
  unconfirmedCount: number;
  onSend: (stepKey: string) => Promise<{ sent: number }>;
};

export default function CommunicationPanel({
  stages,
  unconfirmedCount,
  onSend,
}: CommunicationPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const activeStage = stages.find((s) => s.state === "active");

  async function handleSend() {
    if (!activeStage?.stepKey) return;
    setSending(true);
    try {
      const result = await onSend(activeStage.stepKey);
      toast.success(`Sent ${result.sent} email${result.sent === 1 ? "" : "s"}`);
      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <section>
      <div style={{ marginBottom: 16 }}>
        <h2 className="lf-card-title" style={{ fontSize: 15, fontWeight: 600 }}>Communication</h2>
        <p className="lf-meta">Outbound stages for deliverers</p>
      </div>

      {stages.map((stage) => (
        <div
          key={stage.id}
          className={
            stage.state === "completed"
              ? "lf-comm-stage lf-comm-stage--completed"
              : stage.state === "active"
                ? "lf-comm-stage lf-comm-stage--active"
                : "lf-comm-stage"
          }
          style={stage.state === "upcoming" ? { opacity: 0.85, background: "#fafafa" } : undefined}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{stage.name}</div>
            {stage.state === "completed" && (
              <span className="lf-status-pill lf-status-pill--green">Completed</span>
            )}
            {stage.state === "active" && (
              <span className="lf-status-pill lf-status-pill--blue">Next</span>
            )}
          </div>

          {stage.state === "completed" && stage.sentDate && (
            <div className="lf-meta" style={{ marginTop: 8 }}>Sent {stage.sentDate}</div>
          )}
          {stage.description && (
            <div className="lf-meta" style={{ marginTop: 8 }}>{stage.description}</div>
          )}
          {stage.timing && (
            <div className="lf-meta" style={{ marginTop: 8 }}>{stage.timing}</div>
          )}

          {stage.state === "completed" && stage.yes != null && (
            <div className="lf-comm-responses">
              <span><strong className="lf-comm-yes">{stage.yes}</strong>Yes</span>
              <span><strong>{stage.unresponsive}</strong>Unresponsive</span>
              <span
                title={
                  stage.no
                    ? `${stage.noSkipped ?? 0} skipped, ${stage.noRemoved ?? 0} removed`
                    : undefined
                }
                style={{ cursor: stage.no ? "help" : undefined }}
              >
                <strong className="lf-comm-no">{stage.no}</strong>No
              </span>
            </div>
          )}

          {stage.state === "active" && (
            <button
              type="button"
              className="lf-btn lf-btn--primary"
              style={{ marginTop: 10, width: "100%", justifyContent: "center" }}
              onClick={() => setModalOpen(true)}
              disabled={sending}
            >
              {activeStage?.stepKey === "initial_confirmation"
                ? "Send confirmation request"
                : `Send ${activeStage?.name?.toLowerCase() ?? "message"}`}
            </button>
          )}
        </div>
      ))}

      <SendConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        recipientCount={unconfirmedCount}
        onSend={handleSend}
        sending={sending}
      />
    </section>
  );
}

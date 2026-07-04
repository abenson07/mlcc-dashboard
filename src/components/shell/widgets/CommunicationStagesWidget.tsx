"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import SendConfirmationModal from "@/components/leaflet/deliverers/SendConfirmationModal";
import ShellWidget from "./ShellWidget";

export default function CommunicationStagesWidget() {
  const { commStages, unconfirmedCount, sendComm } = useLeafletContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [sending, setSending] = useState(false);

  if (!commStages || commStages.length === 0) return null;

  const activeStage = commStages.find((s) => s.state === "active");

  async function handleSend() {
    if (!activeStage?.stepKey) return;
    setSending(true);
    try {
      const result = await sendComm(activeStage.stepKey);
      toast.success(`Sent ${result.sent} email${result.sent === 1 ? "" : "s"}`);
      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <ShellWidget title="Communication Stages">
      {commStages.map((stage) => {
        const isCompleted = stage.state === "completed";
        const isActive = stage.state === "active";
        const isUpcoming = stage.state === "upcoming";

        return (
          <div
            key={stage.id}
            className={
              "shell-widget-row" +
              (isActive ? " shell-widget-row--active" : "") +
              (isUpcoming ? " shell-widget-row--muted" : "")
            }
          >
            <div className="shell-widget-comm-info">
              <span
                className={
                  "shell-widget-item-label" +
                  (isCompleted ? "" : isActive ? "" : " shell-widget-item-label--muted")
                }
              >
                {stage.name}
              </span>

              {isCompleted && stage.yes != null && (
                <div className="shell-widget-comm-stats">
                  <span className="shell-widget-comm-stat">
                    <PeopleIcon />
                    {stage.yes}
                  </span>
                  <span className="shell-widget-comm-stat">
                    <MailIcon />
                    {stage.unresponsive}
                  </span>
                  <span className="shell-widget-comm-stat">
                    <CheckIcon />
                    {stage.no}
                  </span>
                  <span className="shell-widget-comm-stat" title={`${stage.noSkipped ?? 0} skipped, ${stage.noRemoved ?? 0} removed`}>
                    <SwapIcon />
                    {stage.noSkipped ?? 0}
                  </span>
                  <span className="shell-widget-comm-sent">
                    {((stage.yes ?? 0) + (stage.unresponsive ?? 0) + (stage.no ?? 0))} Sent
                  </span>
                </div>
              )}

              {isActive && stage.timing && (
                <span className="shell-widget-comm-timing">{stage.timing}</span>
              )}

              {isUpcoming && stage.timing && (
                <span className="shell-widget-comm-timing">{stage.timing}</span>
              )}
            </div>

            {isActive && (
              <button
                type="button"
                className="shell-widget-send-btn"
                onClick={() => setModalOpen(true)}
                disabled={sending}
              >
                {activeStage?.stepKey === "initial_confirmation"
                  ? "Send confirmation request"
                  : "Send"}
              </button>
            )}

            {isUpcoming && (
              <button type="button" className="shell-widget-send-btn shell-widget-send-btn--hidden" disabled>
                Send
              </button>
            )}
          </div>
        );
      })}

      <SendConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        recipientCount={unconfirmedCount}
        onSend={handleSend}
        sending={sending}
      />
    </ShellWidget>
  );
}

function PeopleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="4" r="2.5" />
      <path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <circle cx="10" cy="5" r="2" />
      <path d="M9 12c0-1.3.7-2.5 1.8-3.2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2.5" width="12" height="9" rx="1.5" />
      <path d="M1 3.5l6 4.5 6-4.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4L5.5 10 3 7.5" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 1.5L1.5 4 4 6.5" />
      <path d="M10 7.5L12.5 10 10 12.5" />
      <path d="M1.5 4h8" />
      <path d="M12.5 10H4.5" />
    </svg>
  );
}
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import SendConfirmationModal from "@/components/leaflet/deliverers/SendConfirmationModal";
import CloseOutReviewModal from "@/components/leaflet/close-out/CloseOutReviewModal";
import CloseOutConfirmedModal from "@/components/leaflet/close-out/CloseOutConfirmedModal";
import type { CloseOutMetrics } from "@/lib/leaflets/getCloseOutMetrics";
import ShellWidget from "./ShellWidget";
import WidgetActionButton from "./WidgetActionButton";
import {
  IconStatusConfirmed,
  IconStatusUnresponsive,
  IconStatusDeclined,
  IconStatusSwapNeeded,
} from "./widgetIcons";

export default function CommunicationStagesWidget() {
  const { leafletId, commStages, unconfirmedCount, sendComm, closeLeaflet, refetchAll, netLeafletCountChange } =
    useLeafletContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [endReviewOpen, setEndReviewOpen] = useState(false);
  const [endConfirmedOpen, setEndConfirmedOpen] = useState(false);
  const [endedMetrics, setEndedMetrics] = useState<CloseOutMetrics | null>(null);

  if (!commStages || commStages.length === 0 || !leafletId) return null;

  const activeStage = commStages.find((s) => s.state === "active");
  const allCompleted = commStages.every((s) => s.state === "completed");
  const statsStage = commStages.find((s) => s.yes != null);
  const lastStage = commStages[commStages.length - 1];

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

  async function handleEndLeaflet() {
    await closeLeaflet();
    await refetchAll();
  }

  function handleEnded(metrics: CloseOutMetrics) {
    setEndReviewOpen(false);
    setEndedMetrics(metrics);
    setEndConfirmedOpen(true);
    toast.success("Leaflet closed");
  }

  return (
    <ShellWidget title="Communication Stages" widgetId="communication-stages">
      <div className="shell-widget-net-change">
        Net leaflet change:{" "}
        {netLeafletCountChange > 0
          ? `+${netLeafletCountChange}`
          : netLeafletCountChange === 0
            ? "+0"
            : `−${Math.abs(netLeafletCountChange)}`}
      </div>
      {commStages.map((stage) => {
        const isActive = stage.state === "active";
        const isUpcoming = stage.state === "upcoming";
        const isStatsStage = stage === statsStage;
        const isFinalMetricsRow =
          allCompleted && stage === lastStage && statsStage != null && stage !== statsStage;
        const isBold = isActive || isFinalMetricsRow;

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
                  (isBold ? "" : " shell-widget-item-label--muted")
                }
              >
                {stage.name}
              </span>

              {isStatsStage && !allCompleted && stage.yes != null && (
                <div className="shell-widget-comm-stats">
                  <span className="shell-widget-comm-stat">
                    <IconStatusConfirmed />
                    {stage.yes}
                  </span>
                  <span className="shell-widget-comm-stat">
                    <IconStatusUnresponsive />
                    {stage.unresponsive}
                  </span>
                  <span className="shell-widget-comm-stat">
                    <IconStatusDeclined />
                    {stage.no}
                  </span>
                  <span className="shell-widget-comm-stat" title={`${stage.noSkipped ?? 0} skipped, ${stage.noRemoved ?? 0} removed`}>
                    <IconStatusSwapNeeded />
                    {stage.noSkipped ?? 0}
                  </span>
                </div>
              )}

              {isStatsStage && allCompleted && stage.yes != null && (
                <span className="shell-widget-comm-timing">
                  {stage.sentCount} sent, {stage.yes} confirmed
                </span>
              )}

              {isFinalMetricsRow && (
                <div className="shell-widget-comm-stats">
                  <span className="shell-widget-comm-stat">
                    <IconStatusConfirmed />
                    {statsStage?.yes}
                  </span>
                  <span className="shell-widget-comm-stat">
                    <IconStatusUnresponsive />
                    {statsStage?.unresponsive}
                  </span>
                  <span className="shell-widget-comm-stat">
                    <IconStatusDeclined />
                    {statsStage?.no}
                  </span>
                  <span className="shell-widget-comm-stat" title={`${statsStage?.noSkipped ?? 0} skipped, ${statsStage?.noRemoved ?? 0} removed`}>
                    <IconStatusSwapNeeded />
                    {statsStage?.noSkipped ?? 0}
                  </span>
                </div>
              )}

              {stage.state === "completed" && !isStatsStage && !isFinalMetricsRow && (
                <span className="shell-widget-comm-timing">{stage.sentCount} sent</span>
              )}

              {(isActive || isUpcoming) && stage.timing && (
                <span className="shell-widget-comm-timing">{stage.timing}</span>
              )}
            </div>

            {isStatsStage && !allCompleted && stage.yes != null && (
              <span className="shell-widget-comm-sent">{stage.sentCount} Sent</span>
            )}

            {isActive && (
              <button
                type="button"
                className="shell-widget-send-btn"
                onClick={() => setModalOpen(true)}
                disabled={sending}
              >
                Send
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

      {allCompleted && (
        <WidgetActionButton onClick={() => setEndReviewOpen(true)}>
          Close leaflet run
        </WidgetActionButton>
      )}

      <SendConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        recipientCount={unconfirmedCount}
        onSend={handleSend}
        sending={sending}
      />

      <CloseOutReviewModal
        isOpen={endReviewOpen}
        leafletId={leafletId}
        onClose={() => setEndReviewOpen(false)}
        onClosed={handleEnded}
        onCloseLeaflet={handleEndLeaflet}
      />
      <CloseOutConfirmedModal
        isOpen={endConfirmedOpen}
        leafletId={leafletId}
        metrics={endedMetrics}
        onDone={() => setEndConfirmedOpen(false)}
      />
    </ShellWidget>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { getApiBase } from "@/lib/apiBase";
import type { CloseOutMetrics } from "@/lib/leaflets/getCloseOutMetrics";

type CloseOutReviewModalProps = {
  isOpen: boolean;
  leafletId: string;
  onClose: () => void;
  onClosed: (metrics: CloseOutMetrics) => void;
  onCloseLeaflet: () => Promise<void>;
};

function formatChange(change: number | null) {
  if (change == null) return "—";
  if (change > 0) return `+${change.toLocaleString()}`;
  if (change < 0) return `−${Math.abs(change).toLocaleString()}`;
  return "+0";
}

export default function CloseOutReviewModal({
  isOpen,
  leafletId,
  onClose,
  onClosed,
  onCloseLeaflet,
}: CloseOutReviewModalProps) {
  const [metrics, setMetrics] = useState<CloseOutMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setConfirmText("");
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${getApiBase()}/api/leaflets/${leafletId}/close-out`)
      .then(async (res) => {
        const data = (await res.json()) as { error?: string; metrics?: CloseOutMetrics };
        if (!res.ok) throw new Error(data.error ?? "Failed to load metrics");
        if (!cancelled) setMetrics(data.metrics ?? null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load metrics");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, leafletId]);

  async function handleClose() {
    if (!metrics || confirmText !== "confirm") return;
    setClosing(true);
    setError(null);
    try {
      await onCloseLeaflet();
      onClosed(metrics);
      setConfirmText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close leaflet");
    } finally {
      setClosing(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6">
      <h2 className="lf-h2" style={{ fontSize: 18 }}>Review delivery results</h2>
      <p className="lf-page-desc">
        Closing this edition freezes deliveries and activates the next planned leaflet if one exists.
      </p>

      {loading && <p className="lf-meta" style={{ marginTop: 16 }}>Loading metrics…</p>}
      {error && <p className="lf-text-red" style={{ marginTop: 16, fontSize: 13 }}>{error}</p>}

      {metrics && !loading && (
        <>
          <div className="lf-close-out-metrics" style={{ marginTop: 16 }}>
            <div className="lf-close-out-metric">
              <span className="lf-close-out-metric-label">Deliverers confirmed</span>
              <span className="lf-close-out-metric-value">
                {metrics.deliverersConfirmed.toLocaleString()} / {metrics.deliverersTotal.toLocaleString()}
              </span>
            </div>
            <div className="lf-close-out-metric">
              <span className="lf-close-out-metric-label">Leaflets delivered</span>
              <span className="lf-close-out-metric-value">
                {metrics.leafletsDelivered.toLocaleString()}
              </span>
            </div>
            <div className="lf-close-out-metric">
              <span className="lf-close-out-metric-label">Change vs last run</span>
              <span className="lf-close-out-metric-value">{formatChange(metrics.changeVsLastRun)}</span>
            </div>
            <div className="lf-close-out-metric">
              <span className="lf-close-out-metric-label">Reroutes captured</span>
              <span className="lf-close-out-metric-value">{metrics.reroutes.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <label className="lf-meta" htmlFor="close-confirm-input">Type confirm to close</label>
            <Input
              id="close-confirm-input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="confirm"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
            <Button variant="outline" onClick={onClose} disabled={closing}>Cancel</Button>
            <Button disabled={confirmText !== "confirm" || closing} onClick={handleClose}>
              {closing ? "Closing…" : "Close leaflet"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

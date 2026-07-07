"use client";

import { useState } from "react";
import DelivererPicker from "../routes/DelivererPicker";
import { useLeafletContext } from "../LeafletContext";
import { linkBtnStyle, primaryBtnStyle } from "./actionButtonStyles";

export type CoveringPerson = { id: string; name: string };

type SkipRouteModalProps = {
  routeLabel: string;
  routeId?: string | null;
  excludePersonId?: string | null;
  submitting: boolean;
  onConfirm: (coveringPerson: CoveringPerson | null) => void | Promise<void>;
  onCancel: () => void;
};

export default function SkipRouteModal({
  routeLabel,
  routeId,
  excludePersonId,
  submitting,
  onConfirm,
  onCancel,
}: SkipRouteModalProps) {
  const { pastDeliverersForRoute } = useLeafletContext();
  const [selected, setSelected] = useState<CoveringPerson | null>(null);

  const pastDeliverers = routeId ? pastDeliverersForRoute(routeId, excludePersonId) : [];

  return (
    <div className="lf-modal-overlay" onClick={submitting ? undefined : onCancel}>
      <div
        className="lf-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="skip-route-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lf-modal-header">
          <span id="skip-route-modal-title" className="lf-modal-title">
            Skip route
          </span>
        </div>
        <div className="lf-modal-body">
          <p className="lf-meta" style={{ marginBottom: 12 }}>
            Mark <strong style={{ color: "var(--lf-text)" }}>{routeLabel}</strong> as needing a
            substitute. Optionally choose who&apos;s covering it.
          </p>

          {selected ? (
            <div
              className="lf-selector-item"
              style={{
                border: "1px solid var(--lf-canvas-border)",
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{selected.name}</span>
              <button
                type="button"
                className="lf-link"
                style={linkBtnStyle}
                disabled={submitting}
                onClick={() => setSelected(null)}
              >
                Change
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pastDeliverers.length > 0 && (
                <div>
                  <p className="lf-meta" style={{ marginBottom: 4 }}>
                    Previously covered by
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {pastDeliverers.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="lf-selector-item"
                        style={{ borderRadius: 6, border: "1px solid var(--lf-canvas-border)" }}
                        disabled={submitting}
                        onClick={() => setSelected(p)}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <DelivererPicker
                excludePersonId={excludePersonId}
                disabled={submitting}
                placeholder="Search for someone else…"
                onSelect={(p) => setSelected(p)}
              />
            </div>
          )}
        </div>
        <div className="lf-modal-footer">
          <button
            type="button"
            className="lf-link"
            style={linkBtnStyle}
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="lf-btn lf-btn--primary"
            style={primaryBtnStyle}
            onClick={() => onConfirm(selected)}
            disabled={submitting}
          >
            {submitting ? "Skipping…" : selected ? `Confirm — ${selected.name} covers` : "Confirm skip"}
          </button>
        </div>
      </div>
    </div>
  );
}

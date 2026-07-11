"use client";

import { useState } from "react";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import DelivererPicker from "../routes/DelivererPicker";
import { useLeafletContext } from "../LeafletContext";

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
    <ConfirmDialog
      isOpen
      title="Skip route"
      description={
        <>
          Mark <strong style={{ color: "var(--lf-text)" }}>{routeLabel}</strong> as needing a
          substitute. Optionally choose who&apos;s covering it.
        </>
      }
      confirmLabel={selected ? `Confirm — ${selected.name} covers` : "Confirm skip"}
      tone="primary"
      submitting={submitting}
      onConfirm={() => onConfirm(selected)}
      onCancel={onCancel}
    >
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
    </ConfirmDialog>
  );
}

"use client";

import type { DeliveryWithRelations } from "hooks";

type DeliveryDetailPanelProps = {
  delivery: DeliveryWithRelations;
  showAssign?: boolean;
  readOnly?: boolean;
  onAssign?: (personId: string) => Promise<void>;
  onEmailPastDeliverer?: (personId: string) => Promise<void>;
  emailingPersonId?: string | null;
  history?: { label: string; count: number }[];
  pastDeliverers?: { id: string; name: string }[];
};

export default function DeliveryDetailPanel({
  delivery,
  showAssign = false,
  history = [],
}: DeliveryDetailPanelProps) {
  const route = delivery.routes;

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {showAssign && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>{route?.route_name}</span>
        </div>
      )}

      {!showAssign && history.length > 0 && (
        <div className="lf-detail-card" data-lf-card="delivery-history">
          <div className="lf-card-header">
            <span className="lf-card-title">Delivery history</span>
            <button type="button" className="lf-link" style={{ border: "none", background: "none", padding: 0 }}>See all</button>
          </div>
          <div className="lf-card-body">
            {history.map((h) => (
              <div key={h.label} className="lf-detail-row">
                <span className="lf-detail-label">{h.label}</span>
                <span>{h.count} houses</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

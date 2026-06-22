"use client";

import { useState } from "react";
import type { DeliveryWithRelations } from "hooks";
import { IconMail, IconMapPin, IconUser } from "../icons";
import { openRoutesTableStatusLabel } from "../deliveryUtils";

type DeliveryDetailPanelProps = {
  delivery: DeliveryWithRelations;
  showAssign?: boolean;
  readOnly?: boolean;
  onAssign?: (personId: string) => Promise<void>;
  onEmailPastDeliverer?: (personId: string) => Promise<void>;
  emailingPersonId?: string | null;
  countChange?: number | null;
  history?: { label: string; count: number }[];
  pastDeliverers?: { id: string; name: string }[];
};

function formatChange(change: number) {
  if (change > 0) return `+${change}`;
  if (change < 0) return `−${Math.abs(change)}`;
  return "+0";
}

export default function DeliveryDetailPanel({
  delivery,
  showAssign = false,
  readOnly = false,
  onAssign,
  onEmailPastDeliverer,
  emailingPersonId = null,
  countChange,
  history = [],
  pastDeliverers = [],
}: DeliveryDetailPanelProps) {
  const route = delivery.routes;
  const person = delivery.people;
  const status = openRoutesTableStatusLabel(delivery);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  async function handleAssign(personId: string) {
    if (!onAssign || readOnly) return;
    setAssigningId(personId);
    try {
      await onAssign(personId);
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {showAssign && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>{route?.route_name}</span>
        </div>
      )}

      {!showAssign && person && (
        <div className="lf-detail-card">
          <div className="lf-card-header"><span className="lf-card-title">Who is delivering it</span></div>
          <div className="lf-card-body">
            <div className="lf-detail-icon-row">
              <span className="lf-detail-label">Name</span>
              <span className="lf-detail-icon-value"><IconUser />{person.full_name}</span>
            </div>
            {person.email && (
              <div className="lf-detail-icon-row">
                <span className="lf-detail-label">Contact email</span>
                <span className="lf-detail-icon-value"><IconMail />{person.email}</span>
              </div>
            )}
            {person.address && (
              <div className="lf-detail-icon-row">
                <span className="lf-detail-label">Delivery address</span>
                <span className="lf-detail-icon-value"><IconMapPin />{person.address}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="lf-detail-card">
        <div className="lf-card-header"><span className="lf-card-title">Route details</span></div>
        <div className="lf-card-body">
          <div className="lf-detail-row"><span className="lf-detail-label">Route name</span><span>{route?.route_name ?? "—"}</span></div>
          <div className="lf-detail-row"><span className="lf-detail-label">Route type</span><span>{route?.route_type ?? "—"}</span></div>
          <div className="lf-detail-row"><span className="lf-detail-label">Route count</span><span>{delivery.leaflet_count != null ? `${delivery.leaflet_count} leaflets` : "—"}</span></div>
          {countChange != null && (
            <div className="lf-detail-row">
              <span className="lf-detail-label">Since last delivery</span>
              <span className={countChange < 0 ? "lf-text-red" : "lf-text-green"}>
                {formatChange(countChange)}
              </span>
            </div>
          )}
          <div className="lf-detail-row"><span className="lf-detail-label">Status</span><span>{status}</span></div>
        </div>
      </div>

      {showAssign && (
        <>
          <div className="lf-detail-card">
            <div className="lf-card-header"><span className="lf-card-title">Deliverer</span></div>
            <div className="lf-card-body">
              {person ? (
                <div className="lf-detail-row">
                  <span>{person.full_name}</span>
                  <span className="lf-meta">{status}</span>
                </div>
              ) : (
                <div className="lf-empty-state">
                  <p>No deliverer assigned</p>
                  {pastDeliverers.length > 0 && onAssign && (
                    <button
                      type="button"
                      className="lf-btn lf-btn--accent"
                      disabled={readOnly || assigningId != null}
                      onClick={() => handleAssign(pastDeliverers[0]!.id)}
                    >
                      {assigningId ? "Assigning…" : `Assign ${pastDeliverers[0]!.name}`}
                    </button>
                  )}
                </div>
              )}
              {pastDeliverers.length > 0 && (
                <>
                  <div style={{ height: 1, background: "var(--lf-bg)", margin: "12px 0" }} />
                  <p className="lf-meta" style={{ fontWeight: 600, marginBottom: 8 }}>Past deliverers</p>
                  {pastDeliverers.map((p) => (
                    <div key={p.id} className="lf-detail-row">
                      <span>{p.name}</span>
                      <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        {onEmailPastDeliverer && (
                          <button
                            type="button"
                            className="lf-link"
                            style={{ border: "none", background: "none", padding: 0, display: "inline-flex", alignItems: "center", gap: 4 }}
                            disabled={readOnly || emailingPersonId === p.id}
                            onClick={() => onEmailPastDeliverer(p.id)}
                            title="Email past deliverer"
                          >
                            <IconMail />
                            {emailingPersonId === p.id ? "Sending…" : "Email"}
                          </button>
                        )}
                        {onAssign && (
                          <button
                            type="button"
                            className="lf-link"
                            style={{ border: "none", background: "none", padding: 0 }}
                            disabled={readOnly || assigningId === p.id}
                            onClick={() => handleAssign(p.id)}
                          >
                            {assigningId === p.id ? "Assigning…" : person?.id === p.id ? "Assigned" : "Assign"}
                          </button>
                        )}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="lf-detail-card">
            <div className="lf-card-header"><span className="lf-card-title">Building contact</span></div>
            <div className="lf-card-body">
              <p className="lf-meta" style={{ marginBottom: 8 }}>Building monitor who handles delivery</p>
              <div className="lf-detail-row"><span className="lf-detail-label">Name</span><span>{delivery.building_contact_name ?? "—"}</span></div>
              <div className="lf-detail-row"><span className="lf-detail-label">Phone</span><span>{delivery.building_contact_phone ?? "—"}</span></div>
              <div className="lf-detail-row"><span className="lf-detail-label">Email</span><span>{delivery.building_contact_email ?? "—"}</span></div>
            </div>
          </div>
        </>
      )}

      {!showAssign && history.length > 0 && (
        <div className="lf-detail-card">
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

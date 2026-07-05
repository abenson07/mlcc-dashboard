"use client";

import type { DeliveryWithRelations } from "hooks";
import { getApiBase } from "@/lib/apiBase";
import { IconMail, IconMapPin, IconUser } from "../icons";
import { openRoutesTableStatusLabel } from "../deliveryUtils";
import type { RouteWithPrimaryDeliverer } from "../leafletData";
import DelivererAssignSection from "./DelivererAssignSection";

type DeliveryDetailPanelProps = {
  delivery: DeliveryWithRelations;
  leafletId?: string | null;
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

function primaryDelivererForDelivery(delivery: DeliveryWithRelations) {
  const route = delivery.routes as RouteWithPrimaryDeliverer | null | undefined;
  const primary = route?.primary_deliverer;
  if (!primary) return null;
  return { id: primary.id, name: primary.full_name };
}

export default function DeliveryDetailPanel({
  delivery,
  leafletId = null,
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
  const primaryDeliverer = primaryDelivererForDelivery(delivery);
  const coverSheetHref =
    leafletId != null
      ? `${getApiBase()}/api/leaflets/${leafletId}/deliveries/${delivery.id}/cover-sheet`
      : null;

  const assignSectionProps = {
    person,
    status,
    readOnly,
    onAssign,
    onEmailPastDeliverer,
    emailingPersonId,
    pastDeliverers,
    primaryDeliverer,
  };

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {showAssign && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>{route?.route_name}</span>
        </div>
      )}

      {!showAssign && (
        <div className="lf-detail-card" data-lf-card="who-is-delivering-it">
          <div className="lf-card-header">
            <span className="lf-card-title">Who is delivering it</span>
          </div>
          <div className="lf-card-body">
            {person ? (
              <>
                <div className="lf-detail-icon-row">
                  <span className="lf-detail-label">Name</span>
                  <span className="lf-detail-icon-value">
                    <IconUser />
                    {person.full_name}
                  </span>
                </div>
                {person.email && (
                  <div className="lf-detail-icon-row">
                    <span className="lf-detail-label">Contact email</span>
                    <span className="lf-detail-icon-value">
                      <IconMail />
                      {person.email}
                    </span>
                  </div>
                )}
                {person.address && (
                  <div className="lf-detail-icon-row">
                    <span className="lf-detail-label">Delivery address</span>
                    <span className="lf-detail-icon-value">
                      <IconMapPin />
                      {person.address}
                    </span>
                  </div>
                )}
              </>
            ) : null}
            <DelivererAssignSection
              {...assignSectionProps}
              compact={!onAssign}
              hideCurrentDeliverer={Boolean(person)}
            />
          </div>
        </div>
      )}

      <div className="lf-detail-card" data-lf-card="route-details">
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
          {coverSheetHref && (
            <div className="lf-detail-row">
              <span className="lf-detail-label">Cover sheet</span>
              <a className="lf-link" href={coverSheetHref} target="_blank" rel="noopener noreferrer">
                Print cover sheet
              </a>
            </div>
          )}
        </div>
      </div>

      {showAssign && (
        <>
          <div className="lf-detail-card" data-lf-card="deliverer">
            <div className="lf-card-header"><span className="lf-card-title">Deliverer</span></div>
            <div className="lf-card-body">
              <DelivererAssignSection {...assignSectionProps} />
            </div>
          </div>

          <div className="lf-detail-card" data-lf-card="building-contact">
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

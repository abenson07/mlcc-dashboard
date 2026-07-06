"use client";

import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import { openRoutesTableStatusLabel } from "@/components/leaflet/deliveryUtils";
import { getApiBase } from "@/lib/apiBase";
import ShellWidget from "./ShellWidget";

function formatChange(change: number) {
  if (change > 0) return `+${change}`;
  if (change < 0) return `−${Math.abs(change)}`;
  return "+0";
}

export default function RouteDetailsWidget() {
  const { leafletId, deliveries, selectedDeliveryId, countChangeByRouteId } = useLeafletContext();

  const delivery =
    deliveries.find((d) => d.id === selectedDeliveryId) ?? (selectedDeliveryId ? null : deliveries[0]);

  if (!delivery) return null;

  const route = delivery.routes;
  const status = openRoutesTableStatusLabel(delivery);
  const countChange = countChangeByRouteId(delivery.route_id, delivery.leaflet_count);
  const coverSheetHref =
    leafletId != null
      ? `${getApiBase()}/api/leaflets/${leafletId}/deliveries/${delivery.id}/cover-sheet`
      : null;

  return (
    <ShellWidget title="Route Details" cardId="route-details">
      <div className="shell-widget-detail-row">
        <span className="shell-widget-detail-label">Route name</span>
        <div className="shell-widget-detail-value-box">
          <span className="shell-widget-detail-value">{route?.route_name ?? "—"}</span>
        </div>
      </div>
      <div className="shell-widget-detail-row">
        <span className="shell-widget-detail-label">Route type</span>
        <div className="shell-widget-detail-value-box">
          <span className="shell-widget-detail-value">{route?.route_type ?? "—"}</span>
        </div>
      </div>
      <div className="shell-widget-detail-row">
        <span className="shell-widget-detail-label">Route count</span>
        <div className="shell-widget-detail-value-box">
          <span className="shell-widget-detail-value">
            {delivery.leaflet_count != null ? `${delivery.leaflet_count} leaflets` : "—"}
          </span>
        </div>
      </div>
      {countChange != null && (
        <div className="shell-widget-detail-row">
          <span className="shell-widget-detail-label">Since last delivery</span>
          <div className="shell-widget-detail-value-box">
            <span
              className={`shell-widget-detail-value ${countChange < 0 ? "lf-text-red" : "lf-text-green"}`}
            >
              {formatChange(countChange)}
            </span>
          </div>
        </div>
      )}
      <div className="shell-widget-detail-row">
        <span className="shell-widget-detail-label">Status</span>
        <div className="shell-widget-detail-value-box">
          <span className="shell-widget-detail-value">{status}</span>
        </div>
      </div>
      {coverSheetHref && (
        <div className="shell-widget-detail-row">
          <span className="shell-widget-detail-label">Cover sheet</span>
          <a className="lf-link" href={coverSheetHref} target="_blank" rel="noopener noreferrer">
            Print cover sheet
          </a>
        </div>
      )}
    </ShellWidget>
  );
}

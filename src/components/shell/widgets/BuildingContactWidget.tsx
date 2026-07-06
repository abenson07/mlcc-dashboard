"use client";

import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import ShellWidget from "./ShellWidget";

export default function BuildingContactWidget() {
  const { deliveries, selectedDeliveryId } = useLeafletContext();

  const delivery =
    deliveries.find((d) => d.id === selectedDeliveryId) ?? (selectedDeliveryId ? null : deliveries[0]);

  if (!delivery) return null;
  if (delivery.routes?.route_type !== "Apartments/Condos") return null;

  return (
    <ShellWidget title="Building Contact" cardId="building-contact">
      <p className="lf-meta" style={{ marginBottom: 8 }}>Building monitor who handles delivery</p>
      <div className="shell-widget-detail-row">
        <span className="shell-widget-detail-label">Name</span>
        <div className="shell-widget-detail-value-box">
          <span className="shell-widget-detail-value">{delivery.building_contact_name ?? "—"}</span>
        </div>
      </div>
      <div className="shell-widget-detail-row">
        <span className="shell-widget-detail-label">Phone</span>
        <div className="shell-widget-detail-value-box">
          <span className="shell-widget-detail-value">{delivery.building_contact_phone ?? "—"}</span>
        </div>
      </div>
      <div className="shell-widget-detail-row">
        <span className="shell-widget-detail-label">Email</span>
        <div className="shell-widget-detail-value-box">
          <span className="shell-widget-detail-value">{delivery.building_contact_email ?? "—"}</span>
        </div>
      </div>
    </ShellWidget>
  );
}

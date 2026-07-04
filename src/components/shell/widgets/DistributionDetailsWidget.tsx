"use client";

import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import ShellWidget from "./ShellWidget";

export default function DistributionDetailsWidget() {
  const { leaflet, deliveries } = useLeafletContext();

  if (!leaflet) return null;

  const deliveryDate = new Date(`${leaflet.distribution_date}T12:00:00`).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );
  const totalLeaflets = deliveries
    .reduce((sum, d) => sum + (d.leaflet_count ?? 0), 0)
    .toLocaleString();

  return (
    <ShellWidget title="Distribution Details">
      <div className="shell-widget-detail-row">
        <span className="shell-widget-detail-label">Delivery Date</span>
        <div className="shell-widget-detail-value-box">
          <span className="shell-widget-detail-value">{deliveryDate}</span>
        </div>
      </div>
      <div className="shell-widget-detail-row">
        <span className="shell-widget-detail-label">Leaflets</span>
        <div className="shell-widget-detail-value-box">
          <span className="shell-widget-detail-value">{totalLeaflets}</span>
        </div>
      </div>
    </ShellWidget>
  );
}
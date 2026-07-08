"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import CloseOutReviewModal from "@/components/leaflet/close-out/CloseOutReviewModal";
import CloseOutConfirmedModal from "@/components/leaflet/close-out/CloseOutConfirmedModal";
import { TableRowActionsMenu } from "@/components/ui/table/TableRowActionsMenu";
import type { CloseOutMetrics } from "@/lib/leaflets/getCloseOutMetrics";
import ShellWidget from "./ShellWidget";
import PropertyRow from "./property/PropertyRow";

export default function DistributionDetailsWidget() {
  const { leaflet, leafletId, deliveries, readOnly, closeLeaflet, refetchAll } = useLeafletContext();
  const [endReviewOpen, setEndReviewOpen] = useState(false);
  const [endConfirmedOpen, setEndConfirmedOpen] = useState(false);
  const [endedMetrics, setEndedMetrics] = useState<CloseOutMetrics | null>(null);

  if (!leaflet || !leafletId) return null;

  const deliveryDate = new Date(`${leaflet.distribution_date}T12:00:00`).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );
  const totalLeaflets = deliveries
    .reduce((sum, d) => sum + (d.leaflet_count ?? 0), 0)
    .toLocaleString();

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
    <ShellWidget
      title="Distribution Details"
      widgetId="distribution-details"
      headerAction={
        !readOnly ? (
          <TableRowActionsMenu
            items={[
              { label: "End leaflet", variant: "danger", onClick: () => setEndReviewOpen(true) },
            ]}
          />
        ) : undefined
      }
    >
      <PropertyRow label="Delivery Date">
        <span className="shell-widget-property-static">{deliveryDate}</span>
      </PropertyRow>
      <PropertyRow label="Leaflets">
        <span className="shell-widget-property-static">{totalLeaflets}</span>
      </PropertyRow>

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
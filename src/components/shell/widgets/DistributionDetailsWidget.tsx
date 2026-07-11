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
import InlineDateProperty from "./property/InlineDateProperty";

export default function DistributionDetailsWidget() {
  const { leaflet, leafletId, deliveries, readOnly, closeLeaflet, refetchAll, updateLeaflet } =
    useLeafletContext();
  const [endReviewOpen, setEndReviewOpen] = useState(false);
  const [endConfirmedOpen, setEndConfirmedOpen] = useState(false);
  const [endedMetrics, setEndedMetrics] = useState<CloseOutMetrics | null>(null);

  if (!leaflet || !leafletId) return null;

  const totalLeaflets = deliveries
    .reduce((sum, d) => sum + (d.leaflet_count ?? 0), 0)
    .toLocaleString();

  async function handleSaveDate(field: "distribution_date" | "sponsorship_due_date" | "delivery_date", raw: string) {
    try {
      await updateLeaflet({ [field]: raw || null });
    } catch {
      toast.error("Failed to update date");
    }
  }

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
      <PropertyRow label="Distribution date">
        <InlineDateProperty
          value={leaflet.distribution_date}
          readOnly={readOnly}
          onSave={(raw) => handleSaveDate("distribution_date", raw)}
        />
      </PropertyRow>
      <PropertyRow label="Sponsorship due date">
        <InlineDateProperty
          value={leaflet.sponsorship_due_date ?? ""}
          readOnly={readOnly}
          onSave={(raw) => handleSaveDate("sponsorship_due_date", raw)}
        />
      </PropertyRow>
      <PropertyRow label="Delivery date">
        <InlineDateProperty
          value={leaflet.delivery_date ?? ""}
          readOnly={readOnly}
          onSave={(raw) => handleSaveDate("delivery_date", raw)}
        />
      </PropertyRow>
      <PropertyRow label="Leaflets">
        <span className="shell-widget-property-static" title="determined by routes">
          {totalLeaflets}
        </span>
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
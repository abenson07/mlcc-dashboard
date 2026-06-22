"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCloseOutEligible } from "hooks";
import { useLeafletContext } from "../LeafletContext";
import CloseOutBanner from "./CloseOutBanner";
import CloseOutConfirmedModal from "./CloseOutConfirmedModal";
import CloseOutReviewModal from "./CloseOutReviewModal";
import type { CloseOutMetrics } from "@/lib/leaflets/getCloseOutMetrics";

export default function CloseOutFlow() {
  const { leaflet, leafletId, closeLeaflet, refetchAll } = useLeafletContext();
  const eligible = useCloseOutEligible(leaflet?.status, leaflet?.distribution_date);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [confirmedOpen, setConfirmedOpen] = useState(false);
  const [closedMetrics, setClosedMetrics] = useState<CloseOutMetrics | null>(null);

  async function handleCloseLeaflet() {
    await closeLeaflet();
    await refetchAll();
  }

  function handleClosed(metrics: CloseOutMetrics) {
    setReviewOpen(false);
    setClosedMetrics(metrics);
    setConfirmedOpen(true);
    toast.success("Leaflet closed");
  }

  if (!leaflet || !leafletId) return null;
  if (!eligible && !reviewOpen && !confirmedOpen) return null;

  const showBanner = eligible && !confirmedOpen;

  return (
    <>
      {showBanner && <CloseOutBanner title={leaflet.title} onReview={() => setReviewOpen(true)} />}
      <CloseOutReviewModal
        isOpen={reviewOpen}
        leafletId={leafletId}
        onClose={() => setReviewOpen(false)}
        onClosed={handleClosed}
        onCloseLeaflet={handleCloseLeaflet}
      />
      <CloseOutConfirmedModal
        isOpen={confirmedOpen}
        leafletId={leafletId}
        metrics={closedMetrics}
        onDone={() => setConfirmedOpen(false)}
      />
    </>
  );
}

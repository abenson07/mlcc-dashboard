"use client";

import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { getApiBase } from "@/lib/apiBase";
import type { CloseOutMetrics } from "@/lib/leaflets/getCloseOutMetrics";

type CloseOutConfirmedModalProps = {
  isOpen: boolean;
  leafletId: string;
  metrics: CloseOutMetrics | null;
  onDone: () => void;
};

function celebrationFilename(title: string) {
  const slug = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-|-$/g, "");
  return `${slug || "leaflet"}-celebration.svg`;
}

export default function CloseOutConfirmedModal({
  isOpen,
  leafletId,
  metrics,
  onDone,
}: CloseOutConfirmedModalProps) {
  const imageUrl = `${getApiBase()}/api/leaflets/${leafletId}/close-out/image`;
  const downloadUrl = `${imageUrl}?format=svg`;

  function handleDownload() {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = celebrationFilename(metrics?.title ?? "leaflet");
    link.click();
  }

  return (
    <Modal isOpen={isOpen} onClose={onDone} className="max-w-lg p-6">
      <h2 className="lf-h2" style={{ fontSize: 18 }}>Leaflet closed</h2>
      <p className="lf-page-desc">
        {metrics?.title ?? "This edition"} is now closed. Share the celebration graphic with your team.
      </p>

      <div className="lf-celebration-preview" style={{ marginTop: 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Celebration stats graphic" />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
        <Button variant="outline" onClick={handleDownload}>Download celebration image</Button>
        <Button onClick={onDone}>Done</Button>
      </div>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLeafletQr } from "hooks";
import { downloadQrPng, generateQrPngDataUrl, qrDownloadFilename } from "@/lib/qr";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import { IconDownload } from "./widgetIcons";
import ShellWidget from "./ShellWidget";

export default function QrCodesWidget() {
  const { leaflet, membershipQrCodeId, openRoutesQrCodeId } = useLeafletContext();

  if (!leaflet) return null;
  return (
    <ShellWidget title="QR Codes" widgetId="qr-codes">
      <QrCodeRow
        label="Membership QR Code"
        subtitle="Place in leaflet"
        qrCodeId={membershipQrCodeId}
      />
      <QrCodeRow
        label="Leaflet Routes QR Code"
        qrCodeId={openRoutesQrCodeId}
      />
    </ShellWidget>
  );
}

function QrCodeRow({
  label,
  subtitle,
  qrCodeId,
}: {
  label: string;
  subtitle?: string;
  qrCodeId: string | null;
}) {
  const { data: qr, isLoading } = useLeafletQr(qrCodeId);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  if (!qrCodeId || isLoading) {
    return (
      <div className="shell-widget-media-row">
        <div className="shell-widget-media-thumb" />
        <div className="shell-widget-media-info">
          <span className="shell-widget-media-label">{label}</span>
          {subtitle && <span className="shell-widget-item-sub">{subtitle}</span>}
        </div>
      </div>
    );
  }

  if (!qr?.url) {
    return (
      <div className="shell-widget-media-row">
        <div className="shell-widget-media-thumb" />
        <div className="shell-widget-media-info">
          <span className="shell-widget-media-label">{label}</span>
          {subtitle && <span className="shell-widget-item-sub">{subtitle}</span>}
        </div>
      </div>
    );
  }

  if (!previewUrl) {
    generateQrPngDataUrl(qr.url, 64).then(setPreviewUrl).catch(() => {});
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      if (!qr) return;
      await downloadQrPng(qr.url, qrDownloadFilename(qr));
      toast.success(`${label} downloaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="shell-widget-media-row">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt={label} className="shell-widget-media-thumb" />
      ) : (
        <div className="shell-widget-media-thumb" />
      )}
      <div className="shell-widget-media-info">
        <span className="shell-widget-media-label">{label}</span>
        {subtitle && <span className="shell-widget-item-sub">{subtitle}</span>}
      </div>
      <button
        type="button"
        className="shell-widget-media-download"
        onClick={handleDownload}
        disabled={downloading}
        aria-label={`Download ${label}`}
      >
        <IconDownload />
      </button>
    </div>
  );
}

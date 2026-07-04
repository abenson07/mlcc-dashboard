"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLeafletQr } from "hooks";
import { downloadQrPng, generateQrPngDataUrl, qrDownloadFilename } from "@/lib/qr";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import ShellWidget from "./ShellWidget";

export default function QrCodesWidget() {
  const { leaflet, membershipQrCodeId, openRoutesQrCodeId } = useLeafletContext();

  if (!leaflet) return null;
  return (
    <ShellWidget title="QR Codes">
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
      <div className="shell-widget-row">
        <div className="shell-widget-qr-thumb" />
        <div className="shell-widget-qr-info">
          <span className="shell-widget-item-label">{label}</span>
          {subtitle && <span className="shell-widget-item-sub">{subtitle}</span>}
        </div>
      </div>
    );
  }

  if (!qr?.url) {
    return (
      <div className="shell-widget-row">
        <div className="shell-widget-qr-thumb" />
        <div className="shell-widget-qr-info">
          <span className="shell-widget-item-label">{label}</span>
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
    <div className="shell-widget-row">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt={label} className="shell-widget-qr-thumb" />
      ) : (
        <div className="shell-widget-qr-thumb" />
      )}
      <div className="shell-widget-qr-info">
        <span className="shell-widget-item-label">{label}</span>
        {subtitle && <span className="shell-widget-item-sub">{subtitle}</span>}
      </div>
      <button
        type="button"
        className="shell-widget-row-action"
        onClick={handleDownload}
        disabled={downloading}
        aria-label={`Download ${label}`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 1.5v8M3.5 6.5L7 10l3.5-3.5M1.5 10v2.5h11V10" />
        </svg>
      </button>
    </div>
  );
}
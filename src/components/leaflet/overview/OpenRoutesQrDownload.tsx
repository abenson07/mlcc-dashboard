"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLeafletQr } from "hooks";
import { downloadQrPng, generateQrPngDataUrl, qrDownloadFilename } from "@/lib/qr";
import QRCode from "qrcode";
import { useLeafletContext } from "../LeafletContext";

export default function OpenRoutesQrDownload() {
  const { leaflet, openRoutesQrCodeId, readOnly } = useLeafletContext();
  const { data: qr, isLoading } = useLeafletQr(openRoutesQrCodeId);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  if (!leaflet || !openRoutesQrCodeId) return null;

  async function ensurePreview(url: string) {
    if (previewUrl) return previewUrl;
    const dataUrl = await generateQrPngDataUrl(url, 120);
    setPreviewUrl(dataUrl);
    return dataUrl;
  }

  async function handleDownloadPng() {
    if (!qr?.url) return;
    setDownloading(true);
    try {
      await downloadQrPng(qr.url, qrDownloadFilename(qr));
      toast.success("QR code downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadSvg() {
    if (!qr?.url) return;
    setDownloading(true);
    try {
      const svg = await QRCode.toString(qr.url, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = qrDownloadFilename(qr).replace(/\.png$/, ".svg");
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("QR code downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <section className="lf-card">
        <div className="lf-card-header"><span className="lf-card-title">Open Routes QR</span></div>
        <div className="lf-card-body"><p className="lf-meta">Loading QR code…</p></div>
      </section>
    );
  }

  if (!qr) {
    return (
      <section className="lf-card">
        <div className="lf-card-header"><span className="lf-card-title">Open Routes QR</span></div>
        <div className="lf-card-body"><p className="lf-meta">No open routes QR linked to this leaflet.</p></div>
      </section>
    );
  }

  if (!previewUrl && qr.url) {
    void ensurePreview(qr.url);
  }

  return (
    <section className="lf-card">
      <div className="lf-card-header"><span className="lf-card-title">Open Routes QR</span></div>
      <div className="lf-card-body">
        <div className="lf-qr-block">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Open routes QR preview" className="lf-qr-preview" />
          ) : (
            <div className="lf-qr-preview lf-qr-preview--placeholder" />
          )}
          <div className="lf-qr-meta">
            <p className="lf-meta" style={{ marginBottom: 8 }}>
              Scan to claim an open delivery route.
            </p>
            <p className="lf-qr-url" title={qr.url}>{qr.url}</p>
            <div className="lf-qr-actions">
              <button
                type="button"
                className="lf-small-btn"
                disabled={readOnly || downloading}
                onClick={handleDownloadPng}
              >
                Download PNG
              </button>
              <button
                type="button"
                className="lf-small-btn"
                disabled={readOnly || downloading}
                onClick={handleDownloadSvg}
              >
                Download SVG
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

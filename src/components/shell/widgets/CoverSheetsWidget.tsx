"use client";

import { usePathname } from "next/navigation";
import { getApiBase } from "@/lib/apiBase";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import ShellWidget from "./ShellWidget";

export default function CoverSheetsWidget() {
  const pathname = usePathname() ?? "";
  const { leafletId } = useLeafletContext();

  if (!pathname.endsWith("/deliverers")) return null;

  function handleDownload() {
    if (!leafletId) return;
    window.open(`${getApiBase()}/api/leaflets/${leafletId}/deliveries/cover-sheets`, "_blank");
  }

  return (
    <ShellWidget title="Cover Sheets">
      <div className="shell-widget-row">
        <div className="shell-widget-qr-info">
          <span className="shell-widget-item-label">All routes</span>
        </div>
        <button
          type="button"
          className="shell-widget-row-action"
          onClick={handleDownload}
          disabled={!leafletId}
          aria-label="Download all cover sheets"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 1.5v8M3.5 6.5L7 10l3.5-3.5M1.5 10v2.5h11V10" />
          </svg>
        </button>
      </div>
    </ShellWidget>
  );
}

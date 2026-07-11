"use client";

import { usePathname } from "next/navigation";
import { getApiBase } from "@/lib/apiBase";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import { IconDocument, IconDownload } from "./widgetIcons";
import ShellWidget from "./ShellWidget";

export default function CoverSheetsWidget() {
  const pathname = usePathname() ?? "";
  const { leafletId, deliveries } = useLeafletContext();

  if (!pathname.endsWith("/deliverers")) return null;

  function handleDownload() {
    if (!leafletId) return;
    window.open(`${getApiBase()}/api/leaflets/${leafletId}/deliveries/cover-sheets`, "_blank");
  }

  const count = deliveries.length;

  return (
    <ShellWidget title="Cover Sheets" widgetId="cover-sheets">
      <div className="shell-widget-media-row">
        <div className="shell-widget-media-icon-box">
          <IconDocument size={24} />
        </div>
        <div className="shell-widget-media-info">
          <span className="shell-widget-media-label">Download Sheets</span>
          <span className="shell-widget-item-sub">
            {count} cover sheet{count === 1 ? "" : "s"}
          </span>
        </div>
        <button
          type="button"
          className="shell-widget-media-download"
          onClick={handleDownload}
          disabled={!leafletId}
          aria-label="Download all cover sheets"
        >
          <IconDownload />
        </button>
      </div>
    </ShellWidget>
  );
}

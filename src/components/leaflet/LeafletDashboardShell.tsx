"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import LeafletSelector from "./LeafletSelector";
import LeafletSidebar from "./LeafletSidebar";
import LeafletTopbar from "./LeafletTopbar";
import CloseOutFlow from "./close-out/CloseOutFlow";
import { useLeafletContext } from "./LeafletContext";

const WHITE_CANVAS_ROUTES = [
  "/leaflet/routes",
  "/leaflet/open-routes",
  "/leaflet/substitutions",
  "/leaflet/sponsorships",
];

export default function LeafletDashboardShell({ children }: { children: ReactNode }) {
  const { readOnly, leaflet } = useLeafletContext();
  const pathname = usePathname();
  const whiteCanvas = WHITE_CANVAS_ROUTES.some((r) => pathname?.startsWith(r));

  return (
    <div className="leaflet-app lf-shell">
      <LeafletTopbar />
      <div className="lf-main">
        <div className="lf-sidebar-col">
          <LeafletSelector />
          <LeafletSidebar />
        </div>
        <div className="lf-content-col">
          <CloseOutFlow />
          {readOnly && leaflet && (
            <div className="lf-banner lf-banner--amber">
              This edition is closed — viewing read-only history.
            </div>
          )}
          <main className={whiteCanvas ? "lf-canvas lf-canvas--white" : "lf-canvas"}>{children}</main>
        </div>
      </div>
    </div>
  );
}

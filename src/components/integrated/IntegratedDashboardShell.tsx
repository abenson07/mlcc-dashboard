"use client";

import type { ReactNode } from "react";
import IntegratedTopbar from "./IntegratedTopbar";

type IntegratedDashboardShellProps = {
  children: ReactNode;
  sidebar?: ReactNode;
  topbarCenter?: ReactNode;
  primaryAction?: ReactNode;
  canvasClassName?: string;
  aside?: ReactNode;
};

export default function IntegratedDashboardShell({
  children,
  sidebar,
  topbarCenter,
  primaryAction,
  canvasClassName,
  aside,
}: IntegratedDashboardShellProps) {
  return (
    <div className="leaflet-app lf-shell">
      <IntegratedTopbar center={topbarCenter} primaryAction={primaryAction} />
      <div className="lf-main">
        {sidebar ? <div className="lf-sidebar-col">{sidebar}</div> : null}
        <div className="lf-content-col">
          <div className={canvasClassName ? `lf-canvas ${canvasClassName}` : "lf-canvas"}>{children}</div>
          {aside}
        </div>
      </div>
    </div>
  );
}

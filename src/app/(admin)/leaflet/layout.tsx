import { Suspense } from "react";
import "@/components/leaflet/leaflet.css";
import { LeafletProvider } from "@/components/leaflet/LeafletContext";
import LeafletDashboardShell from "@/components/leaflet/LeafletDashboardShell";

function LeafletLayoutFallback() {
  return (
    <div className="leaflet-app lf-shell" style={{ alignItems: "center", justifyContent: "center" }}>
      <p className="lf-meta">Loading leaflet dashboard…</p>
    </div>
  );
}

export default function LeafletLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LeafletLayoutFallback />}>
      <LeafletProvider>
        <LeafletDashboardShell>{children}</LeafletDashboardShell>
      </LeafletProvider>
    </Suspense>
  );
}

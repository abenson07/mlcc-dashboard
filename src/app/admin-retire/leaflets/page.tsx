import { Suspense } from "react";
import LeafletsListPageContent from "@/components/leaflet/LeafletsListPageContent";

export default function ShellPreviewLeafletsPage() {
  return (
    <Suspense fallback={<p className="lf-meta">Loading leaflets…</p>}>
      <LeafletsListPageContent embedded />
    </Suspense>
  );
}

import { Suspense } from "react";

function LeafletLayoutFallback() {
  return <p className="lf-meta">Loading leaflet…</p>;
}

export default function ShellPreviewLeafletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<LeafletLayoutFallback />}>{children}</Suspense>;
}
import type { Metadata } from "next";
import { SkeletonPageShell } from "@marketing/components/byq/SkeletonPageShell";

export const metadata: Metadata = {
  title: "Leaflet Issues | Maple Leaf Community Council",
  robots: { index: false, follow: true },
};

export default function LeafletIssuesPage() {
  return <SkeletonPageShell title="Leaflet Issues" />;
}

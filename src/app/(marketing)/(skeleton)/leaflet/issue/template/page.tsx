import type { Metadata } from "next";
import { SkeletonPageShell } from "@marketing/components/byq/SkeletonPageShell";

export const metadata: Metadata = {
  title: "Leaflet Issue Template | Maple Leaf Community Council",
  robots: { index: false, follow: true },
};

export default function LeafletIssueTemplatePage() {
  return (
    <SkeletonPageShell
      title="Leaflet Issue Template"
      description="Skeleton leaflet issue detail template."
    />
  );
}

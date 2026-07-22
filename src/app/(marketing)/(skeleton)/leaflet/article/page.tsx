import type { Metadata } from "next";
import { SkeletonPageShell } from "@marketing/components/byq/SkeletonPageShell";

export const metadata: Metadata = {
  title: "Leaflet Article | Maple Leaf Community Council",
  robots: { index: false, follow: true },
};

export default function LeafletArticlePage() {
  return <SkeletonPageShell title="Leaflet Article" />;
}

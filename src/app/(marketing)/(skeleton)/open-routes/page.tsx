import type { Metadata } from "next";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { OpenRoutesSection } from "@marketing/components/byq/OpenRoutesSection";

export const metadata: Metadata = {
  title: "Open Routes | Maple Leaf Community Council",
  description:
    "Pick up an open Leaflet delivery route and help bring Maple Leaf's neighborhood newsletter door to door.",
};

export default function OpenRoutesPage() {
  return (
    <main>
      <OpenRoutesSection title="Open Routes" />
      <CtaSection />
    </main>
  );
}

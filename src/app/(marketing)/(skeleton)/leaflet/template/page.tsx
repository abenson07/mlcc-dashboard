import type { Metadata } from "next";
import { CmsPageSection } from "@marketing/components/byq/CmsPageSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";

export const metadata: Metadata = {
  title: "Leaflet Template | Maple Leaf Community Council",
  robots: { index: false, follow: true },
};

export default function LeafletTemplatePage() {
  return (
    <main>
      <CmsPageSection title="Leaflet Template" />
      <CtaSection />
    </main>
  );
}

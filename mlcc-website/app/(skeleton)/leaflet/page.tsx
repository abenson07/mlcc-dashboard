import { CmsGridSection } from "@marketing/components/byq/CmsGridSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { getPublishedLeafletStories } from "@marketing/data/leaflet-stories";

export default function LeafletPage() {
  return (
    <main>
      <CmsGridSection title="The Leaflet" stories={getPublishedLeafletStories()} />
      <CtaSection />
    </main>
  );
}

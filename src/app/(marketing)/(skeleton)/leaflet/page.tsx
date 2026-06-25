import { CmsGridSection } from "@marketing/components/byq/CmsGridSection";
import { LeafletVolunteerCtaSection } from "@marketing/components/sections/LeafletVolunteerCtaSection";
import { getPublishedLeafletStories } from "@marketing/data/leaflet-stories";

export default function LeafletPage() {
  return (
    <main>
      <CmsGridSection title="The Leaflet" stories={getPublishedLeafletStories()} />
      <LeafletVolunteerCtaSection />
    </main>
  );
}

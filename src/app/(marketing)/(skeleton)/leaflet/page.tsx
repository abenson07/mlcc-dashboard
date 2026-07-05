import { CmsGridSection } from "@marketing/components/byq/CmsGridSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { getPublishedLeafletStories } from "@marketing/data/leaflet-stories";

export default function LeafletPage() {
  return (
    <main>
      <CmsGridSection title="The Leaflet" stories={getPublishedLeafletStories()} />
      <CtaSection
        title="Join the Leaflet team"
        subhead="Help write, design, photograph, and deliver the neighborhood newsletter that reaches Maple Leaf door to door."
        primaryButton={{ label: "Learn about volunteering", href: "/committees/newsletter" }}
        secondaryButton={{ label: "Contact us", href: "/contact" }}
      />
    </main>
  );
}

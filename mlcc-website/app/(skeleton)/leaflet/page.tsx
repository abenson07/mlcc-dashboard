import { CmsGridSection } from "@marketing/components/byq/CmsGridSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { loadPublishedLeafletStories } from "@marketing/data/leaflet-stories";

export default async function LeafletPage() {
  const stories = await loadPublishedLeafletStories();
  return (
    <main>
      <CmsGridSection title="The Leaflet" stories={stories} />
      <CtaSection
        title="Join the Leaflet team"
        subhead="Help write, design, photograph, and deliver the neighborhood newsletter that reaches Maple Leaf door to door."
        primaryButton={{ label: "Learn about volunteering", href: "/committees/newsletter" }}
        secondaryButton={{ label: "Contact us", href: "/contact" }}
      />
    </main>
  );
}

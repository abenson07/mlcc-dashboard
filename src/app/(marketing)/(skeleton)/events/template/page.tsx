import type { Metadata } from "next";
import { CmsPage12Section } from "@marketing/components/byq/CmsPage12Section";
import { CtaSection } from "@marketing/components/byq/CtaSection";

export const metadata: Metadata = {
  title: "Event Template | Maple Leaf Community Council",
  robots: { index: false, follow: true },
};

export default function EventsTemplatePage() {
  return (
    <main>
      <CmsPage12Section title="Events Template" />
      <CtaSection />
    </main>
  );
}

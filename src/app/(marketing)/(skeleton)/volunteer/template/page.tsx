import type { Metadata } from "next";
import { CmsPage6Section } from "@marketing/components/byq/CmsPage6Section";
import { CtaSection } from "@marketing/components/byq/CtaSection";

export const metadata: Metadata = {
  title: "Volunteer Template | Maple Leaf Community Council",
  robots: { index: false, follow: true },
};

export default function VolunteerTemplatePage() {
  return (
    <main>
      <CmsPage6Section title="Volunteer Template" />
      <CtaSection />
    </main>
  );
}

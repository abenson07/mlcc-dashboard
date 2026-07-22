import type { Metadata } from "next";
import { CmsGrid13Section } from "@marketing/components/byq/CmsGrid13Section";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { HeroSection } from "@marketing/components/byq/HeroSection";
import { HomeFaqSection } from "@marketing/components/sections/HomeFaqSection";
import { MembershipPricingSection } from "@marketing/components/sections/MembershipPricingSection";
import { ServicesMarqueeSection } from "@marketing/components/sections/ServicesMarqueeSection";

export const metadata: Metadata = {
  title: "Maple Leaf Community Council",
  description:
    "Connecting neighbors to the people and things that matter most. A volunteer-run community council keeping Maple Leaf, Seattle informed, connected, and involved.",
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ServicesMarqueeSection />
      <CmsGrid13Section />
      <MembershipPricingSection />
      <HomeFaqSection />
      <CtaSection />
    </main>
  );
}

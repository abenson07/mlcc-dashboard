import { CmsGrid13Section } from "@marketing/components/byq/CmsGrid13Section";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { FaqSection } from "@marketing/components/byq/FaqSection";
import { HeroSection } from "@marketing/components/byq/HeroSection";
import { ValueFeature49Section } from "@marketing/components/byq/ValueFeature49Section";
import { ServicesMarqueeSection } from "@marketing/components/sections/ServicesMarqueeSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ServicesMarqueeSection />
      <CmsGrid13Section />
      <ValueFeature49Section />
      <FaqSection />
      <CtaSection />
    </main>
  );
}

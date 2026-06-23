import { CmsGrid13Section } from "@marketing/components/byq/CmsGrid13Section";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { FaqSection } from "@marketing/components/byq/FaqSection";
import { FeatureIntroWithVideoCardsSection } from "@marketing/components/byq/FeatureIntroWithVideoCardsSection";
import { HeroSection } from "@marketing/components/byq/HeroSection";
import { ValueFeature49Section } from "@marketing/components/byq/ValueFeature49Section";
import { ServicesMarqueeSection } from "@marketing/components/sections/ServicesMarqueeSection";

export default function SkeletonHomePage() {
  return (
    <main>
      <HeroSection title="Home" />
      <FeatureIntroWithVideoCardsSection />
      <ServicesMarqueeSection />
      <ValueFeature49Section />
      <CmsGrid13Section />
      <FaqSection />
      <CtaSection />
    </main>
  );
}

import { CenteredTextImageCardsSection } from "@marketing/components/sections/CenteredTextImageCardsSection";
import { CtaSection } from "@marketing/components/sections/CtaSection";
import { FeaturesGridMarqueeSection } from "@marketing/components/sections/FeaturesGridMarqueeSection";
import { HeroSection } from "@marketing/components/sections/HeroSection";
import { Pricing3Section } from "@marketing/components/sections/Pricing3Section";
import { ServicesMarqueeSection } from "@marketing/components/sections/ServicesMarqueeSection";

export default function Home() {
  return (
    <main className="bg-sparkles-cream">
      <HeroSection />
      <ServicesMarqueeSection />
      <Pricing3Section />
      <FeaturesGridMarqueeSection />
      <CenteredTextImageCardsSection />
      <CtaSection />
    </main>
  );
}

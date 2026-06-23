import { DonateAmountSection } from "@marketing/components/sections/DonateAmountSection";
import { DonateCtaSection } from "@marketing/components/sections/DonateCtaSection";
import { DonateGoalSection } from "@marketing/components/sections/DonateGoalSection";
import { DonateImpactSection } from "@marketing/components/sections/DonateImpactSection";
import { DonateMarqueeSection } from "@marketing/components/sections/DonateMarqueeSection";
import { DonateStoriesSection } from "@marketing/components/sections/DonateStoriesSection";
import { DonateValueSection } from "@marketing/components/sections/DonateValueSection";

export default function DonatePage() {
  return (
    <main className="bg-sparkles-cream">
      <DonateMarqueeSection />
      <DonateAmountSection />
      <DonateGoalSection />
      <DonateImpactSection />
      <DonateValueSection />
      <DonateStoriesSection />
      <DonateCtaSection />
    </main>
  );
}

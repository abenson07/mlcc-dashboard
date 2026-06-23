import { SubscribeBenefitsSection } from "@marketing/components/sections/SubscribeBenefitsSection";
import { SubscribeFaqSection } from "@marketing/components/sections/SubscribeFaqSection";
import { SubscribeHeroSection } from "@marketing/components/sections/SubscribeHeroSection";

export default function SubscribePage() {
  return (
    <main>
      <SubscribeHeroSection />
      <SubscribeBenefitsSection />
      <SubscribeFaqSection />
    </main>
  );
}

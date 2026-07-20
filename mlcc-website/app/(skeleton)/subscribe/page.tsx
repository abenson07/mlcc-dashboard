import { OpenRoutesSection } from "@marketing/components/byq/OpenRoutesSection";
import { SubscribeBenefitsSection } from "@marketing/components/sections/SubscribeBenefitsSection";
import { SubscribeFaqSection } from "@marketing/components/sections/SubscribeFaqSection";
import { SubscribeHeroSection } from "@marketing/components/sections/SubscribeHeroSection";

export default function SubscribePage() {
  return (
    <main>
      <SubscribeHeroSection />
      <SubscribeBenefitsSection />
      <OpenRoutesSection title="Prefer paper? Pick up an open route" />
      <SubscribeFaqSection />
    </main>
  );
}

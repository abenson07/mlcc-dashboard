import type { Metadata } from "next";
import { OpenRoutesSection } from "@marketing/components/byq/OpenRoutesSection";
import { SubscribeBenefitsSection } from "@marketing/components/sections/SubscribeBenefitsSection";
import { SubscribeFaqSection } from "@marketing/components/sections/SubscribeFaqSection";
import { SubscribeHeroSection } from "@marketing/components/sections/SubscribeHeroSection";

export const metadata: Metadata = {
  title: "Subscribe | Maple Leaf Community Council",
  description:
    "Subscribe to get the Leaflet and MLCC updates delivered to your inbox, or pick up a paper route to deliver it door to door.",
};

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

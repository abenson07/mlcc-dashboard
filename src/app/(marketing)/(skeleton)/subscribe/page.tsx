import type { Metadata } from "next";
import { OpenRoutesSection } from "@marketing/components/byq/OpenRoutesSection";
import { SubscribeBenefitsSection } from "@marketing/components/sections/SubscribeBenefitsSection";
import { SubscribeFaqSection } from "@marketing/components/sections/SubscribeFaqSection";
import { SubscribeHeroSection } from "@marketing/components/sections/SubscribeHeroSection";
import { loadWebsiteOpenRoutes } from "@/lib/leaflets/loadWebsiteOpenRoutes";

export const metadata: Metadata = {
  title: "Subscribe | Maple Leaf Community Council",
  description:
    "Subscribe to get the Leaflet and MLCC updates delivered to your inbox, or pick up a paper route to deliver it door to door.",
};

export default async function SubscribePage() {
  const routes = await loadWebsiteOpenRoutes();

  return (
    <main>
      <SubscribeHeroSection />
      <SubscribeBenefitsSection />
      <OpenRoutesSection title="Prefer paper? Pick up an open route" routes={routes} />
      <SubscribeFaqSection />
    </main>
  );
}

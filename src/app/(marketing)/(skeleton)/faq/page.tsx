import type { Metadata } from "next";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { AllFaqSection } from "@marketing/components/sections/AllFaqSection";

export const metadata: Metadata = {
  title: "FAQ | Maple Leaf Community Council",
  description:
    "Answers to common questions about the Maple Leaf Community Council: membership, volunteering, events, the Leaflet, and more.",
};

export default function FaqPage() {
  return (
    <main>
      <AllFaqSection />
      <CtaSection />
    </main>
  );
}

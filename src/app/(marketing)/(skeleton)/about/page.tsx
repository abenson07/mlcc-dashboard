import type { Metadata } from "next";
import { AboutBoardSection } from "@marketing/components/sections/AboutBoardSection";
import { AboutCommitteesSection } from "@marketing/components/sections/AboutCommitteesSection";
import { AboutEventsSection } from "@marketing/components/sections/AboutEventsSection";
import { AboutFutureSection } from "@marketing/components/sections/AboutFutureSection";
import { AboutGetInvolvedCtaSection } from "@marketing/components/sections/AboutGetInvolvedCtaSection";
import { AboutHeroSection } from "@marketing/components/sections/AboutHeroSection";
import { AboutHistoryBentoSection } from "@marketing/components/sections/AboutHistoryBentoSection";
import { AboutWhatWeDoSection } from "@marketing/components/sections/AboutWhatWeDoSection";

export const metadata: Metadata = {
  title: "About | Maple Leaf Community Council",
  description:
    "Learn what the Maple Leaf Community Council does, our history in the neighborhood, the committees and events we run, and how to get involved as a volunteer or member.",
};

export default function AboutPage() {
  return (
    <main>
      <AboutHeroSection />
      <AboutWhatWeDoSection />
      <AboutHistoryBentoSection />
      <AboutFutureSection />
      <AboutCommitteesSection />
      <AboutEventsSection />
      <AboutBoardSection />
      <AboutGetInvolvedCtaSection />
    </main>
  );
}

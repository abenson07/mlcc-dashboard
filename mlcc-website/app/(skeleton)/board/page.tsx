import { BoardCouncilIntroSection } from "@marketing/components/sections/BoardCouncilIntroSection";
import { BoardHeroSection } from "@marketing/components/sections/BoardHeroSection";
import { BoardHistorySection } from "@marketing/components/sections/BoardHistorySection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { BoardMembersSection } from "@marketing/components/sections/BoardMembersSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Executive Board | Maple Leaf Community Council",
  description:
    "Meet the executive board of the Maple Leaf Community Council — neighbors who provide leadership and stewardship for our volunteer-run neighborhood organization.",
};

export default function BoardPage() {
  return (
    <main>
      <BoardHeroSection />
      <BoardCouncilIntroSection />
      <BoardHistorySection />
      <BoardMembersSection />
      <CtaSection
        title="Interested in joining the board?"
        subhead="Board positions open up from time to time. If you'd like to learn more about serving on the executive board, we'd love to hear from you."
        primaryButton={{ label: "View open roles", href: "/volunteer" }}
        secondaryButton={{ label: "Contact us", href: "/contact" }}
      />
    </main>
  );
}

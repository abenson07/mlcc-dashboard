import { BoardCouncilIntroSection } from "@marketing/components/sections/BoardCouncilIntroSection";
import { BoardHeroSection } from "@marketing/components/sections/BoardHeroSection";
import { BoardHistorySection } from "@marketing/components/sections/BoardHistorySection";
import { BoardJoinCtaSection } from "@marketing/components/sections/BoardJoinCtaSection";
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
      <BoardJoinCtaSection />
    </main>
  );
}

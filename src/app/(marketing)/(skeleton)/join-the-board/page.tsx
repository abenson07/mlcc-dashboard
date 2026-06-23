import { JoinBoardFormSection } from "@marketing/components/sections/JoinBoardFormSection";
import { JoinBoardLearnMoreSection } from "@marketing/components/sections/JoinBoardLearnMoreSection";
import { JoinBoardRequirementsSection } from "@marketing/components/sections/JoinBoardRequirementsSection";
import { JoinBoardWhatSection } from "@marketing/components/sections/JoinBoardWhatSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the Board | Maple Leaf Community Council",
  description:
    "Express your interest in serving on the Maple Leaf Community Council executive board. Learn what the board does and start a conversation about leadership in your neighborhood.",
};

export default function JoinTheBoardPage() {
  return (
    <main>
      <JoinBoardFormSection />
      <JoinBoardRequirementsSection />
      <JoinBoardWhatSection />
      <JoinBoardLearnMoreSection />
    </main>
  );
}

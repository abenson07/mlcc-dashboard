import { JoinBoardConfirmationSection } from "@marketing/components/sections/JoinBoardConfirmationSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interest Submitted | Maple Leaf Community Council",
  description: "Your interest in joining the MLCC executive board has been received.",
};

export default function JoinTheBoardConfirmationPage() {
  return (
    <main>
      <JoinBoardConfirmationSection />
    </main>
  );
}

import { SubmitStoryConfirmationSection } from "@marketing/components/sections/SubmitStoryConfirmationSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Story Submitted | Maple Leaf Community Council",
  description: "Your Maple Leaf story has been received and is pending review.",
};

export default function SubmitStoryConfirmationPage() {
  return (
    <main>
      <SubmitStoryConfirmationSection />
    </main>
  );
}

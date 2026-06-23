import { SubmitStoryFormSection } from "@marketing/components/sections/SubmitStoryFormSection";
import { SubmitStoryGetInvolvedSection } from "@marketing/components/sections/SubmitStoryGetInvolvedSection";
import { SubmitStoryWhySection } from "@marketing/components/sections/SubmitStoryWhySection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit Story | Maple Leaf Community Council",
  description:
    "Share your Maple Leaf neighborhood story for the Leaflet newsletter. Submit your name, email, story, and optional photos.",
};

export default function SubmitStoryPage() {
  return (
    <main>
      <SubmitStoryFormSection />
      <SubmitStoryWhySection />
      <SubmitStoryGetInvolvedSection />
    </main>
  );
}

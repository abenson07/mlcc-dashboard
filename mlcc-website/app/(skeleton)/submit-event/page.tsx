import { SubmitEventFormSection } from "@marketing/components/sections/SubmitEventFormSection";
import { SubmitEventGetInvolvedSection } from "@marketing/components/sections/SubmitEventGetInvolvedSection";
import { SubmitEventWhySection } from "@marketing/components/sections/SubmitEventWhySection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit an Event | Maple Leaf Community Council",
  description:
    "Share a community event happening in Maple Leaf. Submit your contact info and event details for review by the Maple Leaf Community Council.",
};

export default function SubmitEventPage() {
  return (
    <main>
      <SubmitEventFormSection />
      <SubmitEventWhySection />
      <SubmitEventGetInvolvedSection />
    </main>
  );
}

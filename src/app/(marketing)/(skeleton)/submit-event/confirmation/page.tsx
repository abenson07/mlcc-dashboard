import { SubmitEventConfirmationSection } from "@marketing/components/sections/SubmitEventConfirmationSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Submitted | Maple Leaf Community Council",
  description:
    "Your Maple Leaf community event submission has been received and is pending review.",
};

export default function SubmitEventConfirmationPage() {
  return (
    <main>
      <SubmitEventConfirmationSection />
    </main>
  );
}

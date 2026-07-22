import type { Metadata } from "next";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { MeetingMinutesListSection } from "@marketing/components/byq/MeetingMinutesListSection";

export const metadata: Metadata = {
  title: "Meeting Minutes | Maple Leaf Community Council",
  description:
    "Read meeting minutes from the Maple Leaf Community Council's board and community meetings.",
};

export default function MeetingMinutesPage() {
  return (
    <main>
      <MeetingMinutesListSection title="Meeting Minutes" />
      <CtaSection />
    </main>
  );
}

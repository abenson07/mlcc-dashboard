import type { Metadata } from "next";
import { MeetingMinutesPageSection } from "@marketing/components/byq/MeetingMinutesPageSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";

export const metadata: Metadata = {
  title: "Meeting Minutes Template | Maple Leaf Community Council",
  robots: { index: false, follow: true },
};

export default function MeetingMinutesTemplatePage() {
  return (
    <main>
      <MeetingMinutesPageSection title="Meeting Minutes Template" />
      <CtaSection />
    </main>
  );
}

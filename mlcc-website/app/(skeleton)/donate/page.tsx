import { CtaSection } from "@marketing/components/byq/CtaSection";
import { DonateGoalSection } from "@marketing/components/sections/DonateGoalSection";
import { DonateImpactSection } from "@marketing/components/sections/DonateImpactSection";
import { DonateMarqueeSection } from "@marketing/components/sections/DonateMarqueeSection";
// import { DonateStoriesSection } from "@marketing/components/sections/DonateStoriesSection";
import { DonateValueSection } from "@marketing/components/sections/DonateValueSection";

export default function DonatePage() {
  return (
    <main className="bg-sparkles-cream">
      <DonateMarqueeSection />
      <DonateGoalSection />
      <DonateImpactSection />
      <DonateValueSection />
      {/* <DonateStoriesSection /> */}
      <CtaSection
        title="Every gift strengthens Maple Leaf"
        subhead="Make a one-time donation, or join as a member for steady support year-round."
        primaryButton={{ label: "Donate now", href: "#give" }}
        secondaryButton={{ label: "Become a member", href: "/membership" }}
      />
    </main>
  );
}

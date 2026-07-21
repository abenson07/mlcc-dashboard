import { CtaSection } from "@marketing/components/byq/CtaSection";
import { MembershipMarqueeSection } from "@marketing/components/sections/MembershipMarqueeSection";
import { MembershipPricingSection } from "@marketing/components/sections/MembershipPricingSection";
// import { MembershipStoriesSection } from "@marketing/components/sections/MembershipStoriesSection";
import { MembershipValueSection } from "@marketing/components/sections/MembershipValueSection";

export default function MembershipPage() {
  return (
    <main className="bg-sparkles-cream">
      <MembershipMarqueeSection />
      <MembershipPricingSection editableId="membership.pricing" editableLabel="Membership Pricing" />
      <MembershipValueSection />
      {/* <MembershipStoriesSection /> */}
      <CtaSection
        title="Be part of what makes Maple Leaf home"
        subhead="Individual memberships start at $3/month. Household, senior, student, and business options are available too."
        primaryButton={{ label: "Choose a plan", href: "/subscribe" }}
        secondaryButton={{ label: "Volunteer instead", href: "/volunteer" }}
      />
    </main>
  );
}

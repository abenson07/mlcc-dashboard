import type { Metadata } from "next";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { MembershipMarqueeSection } from "@marketing/components/sections/MembershipMarqueeSection";
import { MembershipPricingSection } from "@marketing/components/sections/MembershipPricingSection";
// import { MembershipStoriesSection } from "@marketing/components/sections/MembershipStoriesSection";
import { MembershipValueSection } from "@marketing/components/sections/MembershipValueSection";

export const metadata: Metadata = {
  title: "Membership | Maple Leaf Community Council",
  description:
    "Become a member of the Maple Leaf Community Council. Individual, household, senior, student, and business memberships start at $3/month.",
};

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

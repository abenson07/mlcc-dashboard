import type { Metadata } from "next";
import { MembershipTierHeroSection } from "@marketing/components/sections/MembershipTierHeroSection";
import { MembershipValueSection } from "@marketing/components/sections/MembershipValueSection";
// import { MembershipStoriesSection } from "@marketing/components/sections/MembershipStoriesSection";
import { findMembershipTier } from "@marketing/data/membership-tiers";

const tier = findMembershipTier("individual")!;

export const metadata: Metadata = {
  title: `${tier.name} Membership | Maple Leaf Community Council`,
  description: tier.description,
};

export default function MembershipIndividualPage() {
  return (
    <main className="bg-sparkles-cream">
      <MembershipTierHeroSection tier="individual" />
      <MembershipValueSection />
      {/* <MembershipStoriesSection /> */}
    </main>
  );
}

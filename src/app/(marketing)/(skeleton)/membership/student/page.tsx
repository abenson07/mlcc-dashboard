import type { Metadata } from "next";
import { MembershipTierHeroSection } from "@marketing/components/sections/MembershipTierHeroSection";
import { MembershipValueSection } from "@marketing/components/sections/MembershipValueSection";
// import { MembershipStoriesSection } from "@marketing/components/sections/MembershipStoriesSection";
import { findMembershipTier } from "@marketing/data/membership-tiers";

const tier = findMembershipTier("student")!;

export const metadata: Metadata = {
  title: `${tier.name} Membership | Maple Leaf Community Council`,
  description: tier.description,
};

export default function MembershipStudentPage() {
  return (
    <main className="bg-sparkles-cream">
      <MembershipTierHeroSection tier="student" />
      <MembershipValueSection />
      {/* <MembershipStoriesSection /> */}
    </main>
  );
}

import { MembershipTierHeroSection } from "@marketing/components/sections/MembershipTierHeroSection";
import { MembershipValueSection } from "@marketing/components/sections/MembershipValueSection";
// import { MembershipStoriesSection } from "@marketing/components/sections/MembershipStoriesSection";

export default function MembershipIndividualPage() {
  return (
    <main className="bg-sparkles-cream">
      <MembershipTierHeroSection tier="individual" />
      <MembershipValueSection />
      {/* <MembershipStoriesSection /> */}
    </main>
  );
}

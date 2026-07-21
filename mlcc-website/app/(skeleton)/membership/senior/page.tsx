import { MembershipTierHeroSection } from "@marketing/components/sections/MembershipTierHeroSection";
import { MembershipValueSection } from "@marketing/components/sections/MembershipValueSection";
// import { MembershipStoriesSection } from "@marketing/components/sections/MembershipStoriesSection";

export default function MembershipSeniorPage() {
  return (
    <main className="bg-sparkles-cream">
      <MembershipTierHeroSection tier="senior" />
      <MembershipValueSection />
      {/* <MembershipStoriesSection /> */}
    </main>
  );
}

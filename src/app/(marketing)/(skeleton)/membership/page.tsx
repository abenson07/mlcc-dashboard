import { MembershipCtaSection } from "@marketing/components/sections/MembershipCtaSection";
import { MembershipGoalSection } from "@marketing/components/sections/MembershipGoalSection";
import { MembershipMarqueeSection } from "@marketing/components/sections/MembershipMarqueeSection";
import { MembershipStoriesSection } from "@marketing/components/sections/MembershipStoriesSection";
import { MembershipValueSection } from "@marketing/components/sections/MembershipValueSection";

export default function MembershipPage() {
  return (
    <main className="bg-sparkles-cream">
      <MembershipMarqueeSection />
      <MembershipGoalSection />
      <MembershipValueSection />
      <MembershipStoriesSection />
      <MembershipCtaSection />
    </main>
  );
}

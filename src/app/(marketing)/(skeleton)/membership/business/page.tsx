import { BusinessMembershipBenefitsSection } from "@marketing/components/sections/BusinessMembershipBenefitsSection";
import { BusinessMembershipCtaSection } from "@marketing/components/sections/BusinessMembershipCtaSection";
import { BusinessMembershipHeroSection } from "@marketing/components/sections/BusinessMembershipHeroSection";
import { BusinessMembershipPerksSection } from "@marketing/components/sections/BusinessMembershipPerksSection";
import { BusinessMembershipPricingSection } from "@marketing/components/sections/BusinessMembershipPricingSection";
import { BusinessMembershipValueSection } from "@marketing/components/sections/BusinessMembershipValueSection";

export default function MembershipBusinessPage() {
  return (
    <main>
      <BusinessMembershipHeroSection />
      <BusinessMembershipValueSection />
      <BusinessMembershipPerksSection />
      <BusinessMembershipBenefitsSection />
      <BusinessMembershipPricingSection />
      <BusinessMembershipCtaSection />
    </main>
  );
}

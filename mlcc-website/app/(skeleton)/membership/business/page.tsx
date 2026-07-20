import { CtaSection } from "@marketing/components/byq/CtaSection";
import { BusinessMembershipBenefitsSection } from "@marketing/components/sections/BusinessMembershipBenefitsSection";
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
      <CtaSection
        title="Stand with your neighbors. Grow with your community."
        subhead="Business membership is $200 per year. Questions? Reach out to the Business Committee; we're happy to help."
        primaryButton={{ label: "Join for $200/year", href: "/subscribe" }}
        secondaryButton={{ label: "Contact us", href: "/committees/business-committee" }}
      />
    </main>
  );
}

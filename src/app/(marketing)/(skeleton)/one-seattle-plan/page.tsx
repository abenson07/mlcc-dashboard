import { BentoSection } from "@marketing/components/byq/BentoSection";
import { CmsGrid26Section } from "@marketing/components/byq/CmsGrid26Section";
import { ContactCtaPreFooterSection } from "@marketing/components/byq/ContactCtaPreFooterSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { IntroText13Section } from "@marketing/components/byq/IntroText13Section";
import { ValueFeature50Section } from "@marketing/components/byq/ValueFeature50Section";
import { ValueFeature57Section } from "@marketing/components/byq/ValueFeature57Section";
import { ValueFeatures29Section } from "@marketing/components/byq/ValueFeatures29Section";
import { VisionSection } from "@marketing/components/byq/VisionSection";
// import { TestimonialsSection } from "@marketing/components/byq/TestimonialsSection";

export default function OneSeattlePlanPage() {
  return (
    <main>
      <ValueFeatures29Section title="Maple Leaf Zoning Workshops" />
      <VisionSection />
      <ValueFeature50Section />
      {/* <TestimonialsSection /> */}
      <BentoSection />
      <ValueFeature57Section />
      <IntroText13Section />
      <CmsGrid26Section />
      <ContactCtaPreFooterSection committeeName="Advocacy" headline="Join the advocacy committee" />
      <CtaSection
        title="Ready to build a better Maple Leaf for everyone?"
        subhead="Reach out or join us at an upcoming workshop."
        primaryButton={{ label: "Get involved", href: "/contact" }}
        secondaryButton={{ label: "Become a member", href: "/membership" }}
      />
    </main>
  );
}

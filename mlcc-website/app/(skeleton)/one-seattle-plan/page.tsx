import { BentoSection } from "@marketing/components/byq/BentoSection";
import { CmsGrid26Section } from "@marketing/components/byq/CmsGrid26Section";
import { ContactCtaPreFooterSection } from "@marketing/components/byq/ContactCtaPreFooterSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { IntroText12Section } from "@marketing/components/byq/IntroText12Section";
import { IntroText13Section } from "@marketing/components/byq/IntroText13Section";
import { ValueFeature50Section } from "@marketing/components/byq/ValueFeature50Section";
import { ValueFeature53Section } from "@marketing/components/byq/ValueFeature53Section";
import { ValueFeature57Section } from "@marketing/components/byq/ValueFeature57Section";
import { ValueFeatures29Section } from "@marketing/components/byq/ValueFeatures29Section";

export default function OneSeattlePlanPage() {
  return (
    <main>
      <ValueFeatures29Section title="One Seattle Plan" />
      <IntroText12Section />
      <ValueFeature50Section />
      <ValueFeature53Section />
      <ValueFeature57Section />
      <BentoSection />
      <CmsGrid26Section />
      <IntroText13Section />
      <ContactCtaPreFooterSection />
      <CtaSection />
    </main>
  );
}

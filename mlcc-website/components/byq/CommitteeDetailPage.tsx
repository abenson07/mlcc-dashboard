import { CmsGrid6Section } from "@marketing/components/byq/CmsGrid6Section";
import { ContactCtaPreFooterSection } from "@marketing/components/byq/ContactCtaPreFooterSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { Hero35Section } from "@marketing/components/byq/Hero35Section";
import { IntroText12Section } from "@marketing/components/byq/IntroText12Section";
import { Team4Section } from "@marketing/components/byq/Team4Section";
import { ValueFeature48Section } from "@marketing/components/byq/ValueFeature48Section";
import { COMMITTEE_CONTENT, type CommitteeSlug } from "@marketing/data/committees";

function formatCommitteeTitle(name: string): string {
  const trimmed = name.trim();
  if (/committee$/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed} committee`;
}

export function CommitteeDetailPage({ slug }: { slug: CommitteeSlug }) {
  const committee = COMMITTEE_CONTENT[slug];

  return (
    <main>
      <Hero35Section title={formatCommitteeTitle(committee.title)} />
      <IntroText12Section headline={committee.headline} body={committee.body} />
      {committee.featureSection ? (
        <ValueFeature48Section
          label={committee.featureSection.label}
          headline={committee.featureSection.headline}
          cards={committee.featureSection.cards}
        />
      ) : null}
      <Team4Section />
      <CmsGrid6Section />
      <ContactCtaPreFooterSection committeeName={committee.title} />
      <CtaSection />
    </main>
  );
}

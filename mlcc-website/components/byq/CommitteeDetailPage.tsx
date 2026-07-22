import { CmsGrid6Section } from "@marketing/components/byq/CmsGrid6Section";
import { ContactCtaPreFooterSection } from "@marketing/components/byq/ContactCtaPreFooterSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { Team4Section } from "@marketing/components/byq/Team4Section";
import { ValueFeature48Section } from "@marketing/components/byq/ValueFeature48Section";
import { CommitteeSpotlightSection } from "@marketing/components/sections/CommitteeSpotlightSection";
import { COMMITTEE_CONTENT, COMMITTEE_LISTINGS, type CommitteeSlug } from "@marketing/data/committees";

export function CommitteeDetailPage({ slug }: { slug: CommitteeSlug }) {
  const committee = COMMITTEE_CONTENT[slug];
  const committeeImage = COMMITTEE_LISTINGS.find((listing) => listing.slug === slug)?.image;

  return (
    <main>
      <CommitteeSpotlightSection
        committeeName={committee.title}
        headline={committee.headline}
        body={committee.body}
        image={committeeImage}
      />
      {committee.featureSection ? (
        <ValueFeature48Section
          label={committee.featureSection.label}
          headline={committee.featureSection.headline}
          cards={committee.featureSection.cards}
        />
      ) : null}
      <Team4Section
        image={committeeImage}
        label={committee.aboutSection?.label}
        headline={committee.aboutSection?.headline}
        body={committee.aboutSection?.body}
      />
      {committee.eventSection ? (
        <Team4Section
          image={committee.eventSection.image}
          label={committee.eventSection.label}
          headline={committee.eventSection.headline}
          body={committee.eventSection.body}
          href={committee.eventSection.href}
          buttonLabel={committee.eventSection.buttonLabel}
          editableId="committee.event-spotlight"
          editableLabel="Event Spotlight"
        />
      ) : null}
      <CmsGrid6Section committee={slug} body={committee.getInvolvedBody} />
      <ContactCtaPreFooterSection committeeName={committee.title} image={committeeImage} />
      <CtaSection {...committee.cta} />
    </main>
  );
}

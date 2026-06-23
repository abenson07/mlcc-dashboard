import { CmsGridCommitteesSection } from "@marketing/components/byq/CmsGridCommitteesSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { CommitteesFaqSection } from "@marketing/components/sections/CommitteesFaqSection";
import { CommitteesHeroSection } from "@marketing/components/sections/CommitteesHeroSection";
import { CommitteesValueFeaturesSection } from "@marketing/components/sections/CommitteesValueFeaturesSection";

export default function CommitteesPage() {
  return (
    <main>
      <CmsGridCommitteesSection />
      <CommitteesHeroSection />
      <CommitteesValueFeaturesSection />
      <CommitteesFaqSection />
      <CtaSection />
    </main>
  );
}

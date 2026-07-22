import type { Metadata } from "next";
import { CmsGridCommitteesSection } from "@marketing/components/byq/CmsGridCommitteesSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { CommitteesFaqSection } from "@marketing/components/sections/CommitteesFaqSection";
import { CommitteesHeroSection } from "@marketing/components/sections/CommitteesHeroSection";
import { CommitteesValueFeaturesSection } from "@marketing/components/sections/CommitteesValueFeaturesSection";

export const metadata: Metadata = {
  title: "Committees | Maple Leaf Community Council",
  description:
    "Explore MLCC's volunteer committees, Newsletter, Events, Emergency Hub, Communications, Advocacy, and Business, and find where to get involved in Maple Leaf.",
};

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

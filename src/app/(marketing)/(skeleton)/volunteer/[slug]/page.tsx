import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPage6Section } from "@marketing/components/byq/CmsPage6Section";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import {
  getVolunteerOpportunity,
  getVolunteerSlackCommitteeName,
  volunteerOpportunities,
} from "@marketing/data/volunteers";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return volunteerOpportunities.map((opportunity) => ({ slug: opportunity.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = getVolunteerOpportunity(slug);

  if (!opportunity) {
    return {};
  }

  return {
    title: `${opportunity.title} | Volunteer`,
    description: opportunity.description,
  };
}

export default async function VolunteerOpportunityPage({ params }: PageProps) {
  const { slug } = await params;
  const opportunity = getVolunteerOpportunity(slug);

  if (!opportunity) {
    notFound();
  }

  return (
    <main>
      <CmsPage6Section
        title={opportunity.title}
        detail={opportunity.detail}
        signupIdPrefix={opportunity.slug}
        currentSlug={opportunity.slug}
        committeeName={getVolunteerSlackCommitteeName(opportunity)}
      />
      <CtaSection />
    </main>
  );
}

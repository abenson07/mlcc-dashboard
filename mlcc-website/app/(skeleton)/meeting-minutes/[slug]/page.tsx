import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MeetingMinutesPageSection } from "@marketing/components/byq/MeetingMinutesPageSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import {
  formatMeetingMinutesTitle,
  getMeetingMinutesEntry,
  meetingMinutes,
} from "@marketing/data/meeting-minutes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return meetingMinutes.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getMeetingMinutesEntry(slug);

  if (!entry) {
    return {};
  }

  return {
    title: `${formatMeetingMinutesTitle(entry)} | Meeting Minutes`,
  };
}

export default async function MeetingMinutesDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getMeetingMinutesEntry(slug);

  if (!entry) {
    notFound();
  }

  return (
    <main>
      <MeetingMinutesPageSection
        title={formatMeetingMinutesTitle(entry)}
        entry={entry}
        currentSlug={entry.slug}
      />
      <CtaSection />
    </main>
  );
}

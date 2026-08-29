import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPage12Section } from "@marketing/components/byq/CmsPage12Section";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { events, getMergedEvents, getRelatedEvents, getUpcomingEvents } from "@marketing/data/events";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const merged = await getMergedEvents();
  const event = merged.find((item) => item.slug === slug);

  if (!event) {
    return {};
  }

  return {
    title: `${event.title} | Events`,
    description: event.shortDescription,
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const merged = await getMergedEvents();
  const event = merged.find((item) => item.slug === slug);

  if (!event) {
    notFound();
  }

  const relatedEvents = getRelatedEvents(event.slug, 2, getUpcomingEvents(merged));

  return (
    <main>
      <CmsPage12Section title={event.title} event={event} relatedEvents={relatedEvents} />
      <CtaSection />
    </main>
  );
}

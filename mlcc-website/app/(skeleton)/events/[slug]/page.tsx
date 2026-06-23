import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPage12Section } from "@marketing/components/byq/CmsPage12Section";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { events, getEvent } from "@marketing/data/events";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);

  if (!event) {
    return {};
  }

  return {
    title: `${event.title} — Events`,
    description: event.shortDescription,
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEvent(slug);

  if (!event) {
    notFound();
  }

  return (
    <main>
      <CmsPage12Section title={event.title} event={event} currentSlug={event.slug} />
      <CtaSection />
    </main>
  );
}

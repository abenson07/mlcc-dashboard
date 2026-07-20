import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageSection } from "@marketing/components/byq/CmsPageSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import {
  getLeafletStory,
  getPublishedLeafletStories,
  getRelatedLeafletStories,
} from "@marketing/data/leaflet-stories";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPublishedLeafletStories().map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getLeafletStory(slug);

  if (!story) {
    return {};
  }

  return {
    title: `${story.title} | The Leaflet`,
    description: `${story.type} story from The Leaflet.`,
  };
}

export default async function LeafletStoryTemplatePage({ params }: PageProps) {
  const { slug } = await params;
  const story = getLeafletStory(slug);

  if (!story || story.draft) {
    notFound();
  }

  return (
    <main>
      <CmsPageSection
        title={story.title}
        story={story}
        relatedStories={getRelatedLeafletStories(slug)}
      />
      <CtaSection />
    </main>
  );
}

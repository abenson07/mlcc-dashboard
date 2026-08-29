import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageSection } from "@marketing/components/byq/CmsPageSection";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import {
  loadLeafletStory,
  loadPublishedLeafletStories,
  loadRelatedLeafletStories,
} from "@marketing/data/leaflet-stories";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const stories = await loadPublishedLeafletStories();
  return stories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await loadLeafletStory(slug);

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
  const story = await loadLeafletStory(slug);

  if (!story || story.draft) {
    notFound();
  }

  return (
    <main>
      <CmsPageSection
        title={story.title}
        story={story}
        relatedStories={await loadRelatedLeafletStories(slug)}
      />
      <CtaSection />
    </main>
  );
}

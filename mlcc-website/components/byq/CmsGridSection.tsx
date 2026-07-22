import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import {
  formatLeafletAuthor,
  formatLeafletDate,
  getLeafletStoryExcerpt,
  type LeafletStory,
} from "@marketing/data/leaflet-stories";

const submitStoryHref =
  "mailto:hello@mapleleafcommunity.org?subject=Leaflet%20story%20submission";

const featuredImage = "/images/patterns/pattern-vertical.svg";

const blogCards = Array(9).fill({
  category: "Wellness",
  date: "May 6, 2024",
  title: "How to Optimize Your Business Operations for Maximum Efficiency",
  image: "/images/patterns/pattern-vertical.svg",
});

function sortStories(stories: LeafletStory[]) {
  return [...stories].sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

function StoryMeta({
  type,
  publishDate,
  author,
}: {
  type: string;
  publishDate: string;
  author: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-body text-xs leading-4 font-normal text-sparkles-navy">{type}</span>
      <span className="font-body text-xs leading-4 font-normal text-sparkles-navy/50">·</span>
      <span className="font-body text-xs leading-4 font-normal text-sparkles-navy">
        {formatLeafletDate(publishDate)}
      </span>
      <span className="font-body text-xs leading-4 font-normal text-sparkles-navy/50">·</span>
      <span className="font-body text-xs leading-4 font-normal text-sparkles-navy">
        {formatLeafletAuthor(author)}
      </span>
    </div>
  );
}

function SubmitStoryPromotionCard() {
  return (
    <a
      href={submitStoryHref}
      className="flex min-h-[26rem] w-full flex-col justify-between gap-6 rounded-2xl bg-sparkles-warm p-6 text-sparkles-navy no-underline max-[767px]:min-h-[22rem]"
    >
      <div className="flex flex-col gap-4">
        <div className="font-body text-xs leading-4 font-normal text-sparkles-navy">Community voices</div>
        <div className="font-display text-[1.5rem] leading-7 font-bold tracking-[-0.03125rem] text-puget-night max-[767px]:text-xl max-[767px]:leading-6">
          Have a Maple Leaf story to tell?
        </div>
        <p className="m-0 font-body text-sm leading-5 text-sparkles-navy">
          We welcome neighborhood updates, event recaps, and the stories that make Maple Leaf feel like home.
        </p>
      </div>
      <span className="font-display text-sm leading-5 font-bold uppercase text-sparkles-navy">
        Submit your story
      </span>
    </a>
  );
}

function buildStoryGridItems(stories: LeafletStory[]) {
  const storyCards = stories.map((story) => <StoryCard key={story.slug} story={story} />);
  const promoCard = <SubmitStoryPromotionCard key="submit-story" />;
  const promoIndex = 4;

  if (storyCards.length <= promoIndex) {
    return [...storyCards, promoCard];
  }

  return [...storyCards.slice(0, promoIndex), promoCard, ...storyCards.slice(promoIndex)];
}

function StoryCard({
  story,
  featured = false,
}: {
  story: LeafletStory;
  featured?: boolean;
}) {
  const image = story.image ?? featuredImage;

  if (featured) {
    return (
      <Link
        href={`/leaflet/template/${story.slug}`}
        className="grid w-full grid-cols-[1.5fr_1fr] gap-12 text-sparkles-navy no-underline max-[767px]:grid-cols-1 max-[767px]:gap-4"
      >
        <div className="relative h-[28.5rem] w-full overflow-hidden rounded-2xl max-[767px]:h-[15rem]">
          <img loading="lazy" src={image} alt="" className="z-[1] h-full w-full object-cover" />
        </div>
        <div className="flex flex-col gap-4 max-[767px]:gap-2">
          <div className="flex flex-col gap-4 max-[767px]:gap-1">
            <StoryMeta type={story.type} publishDate={story.publishDate} author={story.author} />
            <div className="font-display text-[2.5rem] leading-[2.75rem] font-bold tracking-[-0.0625rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
              {story.title}
            </div>
          </div>
          <p className="m-0 font-body text-base leading-6 text-sparkles-navy">
            {getLeafletStoryExcerpt(story.body)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/leaflet/template/${story.slug}`}
      className="flex w-full flex-col gap-4 text-sparkles-navy no-underline"
    >
      <div className="relative h-[16.875rem] w-full overflow-hidden rounded-2xl">
        <img loading="lazy" src={image} alt="" className="z-[1] h-full w-full object-cover" />
      </div>
      <div className="flex flex-col gap-4 max-[767px]:gap-2">
        <div className="flex flex-col gap-4 max-[767px]:gap-1">
          <span className="font-body text-xs leading-4 font-normal text-sparkles-navy">
            {formatLeafletDate(story.publishDate)}
          </span>
          <div className="font-display text-[1.5rem] leading-7 font-bold tracking-[-0.03125rem] text-puget-night max-[767px]:text-xl max-[767px]:leading-6">
            {story.title}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-body text-xs leading-4 font-normal text-sparkles-navy">{story.type}</span>
          <span className="font-body text-xs leading-4 font-normal text-sparkles-navy/50">·</span>
          <span className="font-body text-xs leading-4 font-normal text-sparkles-navy">
            {formatLeafletAuthor(story.author)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CmsGridSection({
  title,
  stories,
}: {
  title: string;
  stories?: LeafletStory[];
}) {
  const sortedStories = stories ? sortStories(stories) : null;
  const featuredStory =
    sortedStories?.find((story) => story.featured) ?? sortedStories?.[0] ?? null;
  const gridStories = sortedStories?.filter((story) => story.slug !== featuredStory?.slug) ?? null;

  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="leaflet.cms-grid"
      data-editable-label="Leaflet CMS Grid"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="pb-[7.5rem] pt-16 max-[767px]:py-20 max-[767px]:pt-10">
            <div className="mb-20 flex max-w-[35.25rem] flex-col gap-6 max-[767px]:max-w-none">
              <SectionLabel className="self-start">
                {stories ? "Stories" : "Label placeholder"}
              </SectionLabel>
              <h1 className="m-0 font-display text-[3.75rem] leading-16 font-bold tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                {title}
              </h1>
            </div>

            <div className="mb-0">
              {featuredStory ? (
                <StoryCard story={featuredStory} featured />
              ) : (
                <a
                  href="/leaflet/template"
                  className="grid w-full grid-cols-[1.5fr_1fr] gap-4 text-sparkles-navy no-underline max-[767px]:grid-cols-1"
                >
                  <div className="relative h-[28.5rem] w-full overflow-hidden rounded-2xl max-[767px]:h-[15rem]">
                    <img
                      loading="lazy"
                      src={featuredImage}
                      alt=""
                      className="z-[1] h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-body text-xs leading-4 font-normal text-sparkles-navy">Wellness</span>
                      <span className="font-body text-xs leading-4 font-normal text-sparkles-navy/50">·</span>
                      <span className="font-body text-xs leading-4 font-normal text-sparkles-navy">May 6, 2024</span>
                    </div>
                    <div className="font-display text-[2.5rem] leading-[2.75rem] font-bold tracking-[-0.0625rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                      Skeleton article heading exists here until real words replace it
                    </div>
                  </div>
                </a>
              )}
            </div>

            <div className="my-20 h-px w-full border-b border-sparkles-navy/16" />

            <div className="mb-20">
              <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                {stories ? "More stories" : "Headline skeleton placeholder"}
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-8 max-[991px]:grid-cols-2 max-[479px]:grid-cols-1">
              {gridStories ? buildStoryGridItems(gridStories) : blogCards.map((card, index) => (
                    <a
                      key={index}
                      href="/leaflet/template"
                      className="flex w-full flex-col gap-4 text-sparkles-navy no-underline"
                    >
                      <div className="relative h-[16.875rem] w-full overflow-hidden rounded-2xl">
                        <img loading="lazy" src={card.image} alt="" className="z-[1] h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <span className="font-body text-xs leading-4 font-normal text-sparkles-navy">
                            {card.category}
                          </span>
                          <span className="font-body text-xs leading-4 font-normal text-sparkles-navy/50">·</span>
                          <span className="font-body text-xs leading-4 font-normal text-sparkles-navy">
                            {card.date}
                          </span>
                        </div>
                        <div className="font-display text-[1.5rem] leading-7 font-bold tracking-[-0.03125rem] text-puget-night max-[767px]:text-xl max-[767px]:leading-6">
                          {card.title}
                        </div>
                      </div>
                    </a>
                  ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default CmsGridSection;

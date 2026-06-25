"use client";

import Link from "next/link";
import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";
import {
  formatLeafletAuthor,
  formatLeafletDate,
  type LeafletStory,
} from "@marketing/data/leaflet-stories";

const skeletonRelatedCards = [
  {
    img: "https://byqsupply-components.netlify.app/skeletons/cms-page/images/blogcmspage7.svg",
    title: "Article skeleton title placeholder for layout demonstration only",
    label: "Label",
    href: "/leaflet/template",
  },
  {
    img: "https://byqsupply-components.netlify.app/skeletons/cms-page/images/vertical-pattern-2.svg",
    title: "Article skeleton title placeholder for layout demonstration only",
    label: "Label",
    href: "/leaflet/template",
  },
];

const skeletonHeroImage =
  "https://byqsupply-components.netlify.app/skeletons/cms-page/images/blogcmspage7.svg";

function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const ref = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const parent = ref.current.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const progress = -rect.top / window.innerHeight;
      ref.current.style.transform = `translateY(${progress * 60}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <img
      ref={ref}
      loading="lazy"
      src={src}
      alt={alt}
      className="z-[1] w-full object-cover"
      style={{ height: "150%" }}
    />
  );
}

export function CmsPageSection({
  title,
  story,
  relatedStories,
}: {
  title: string;
  story?: LeafletStory;
  relatedStories?: LeafletStory[];
}) {
  const heroImage = story?.image ?? skeletonHeroImage;

  return (
    <div className="bg-sparkles-cream text-sparkles-navy">
      <section className="bg-sparkles-cream">
        <div className="px-8 max-[767px]:px-4">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="py-20 max-[767px]:py-16">
              <div className="mx-auto mb-16 flex max-w-[42.5rem] flex-col items-center justify-start gap-6 text-center max-[479px]:gap-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <SectionLabel>{story?.type ?? "Label"}</SectionLabel>
                  {story ? (
                    <SectionLabel>{formatLeafletDate(story.publishDate)}</SectionLabel>
                  ) : (
                    <SectionLabel>More Label</SectionLabel>
                  )}
                </div>
                <h1 className="m-0 font-display text-[3.75rem] leading-16 font-bold tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <SectionLabel>{story ? formatLeafletAuthor(story.author) : "Author"}</SectionLabel>
                </div>
              </div>

              {story?.image ? (
                <div className="h-[30rem] w-full overflow-hidden rounded-2xl max-[991px]:h-[22.5rem] max-[767px]:h-[18.75rem] max-[479px]:h-[15.6rem]">
                  <ParallaxImage src={heroImage} alt="" />
                </div>
              ) : null}
            </div>
          </div>

          <div className="mx-auto max-w-[35.25rem] max-[991px]:w-full max-[991px]:max-w-none">
            {story ? (
              <div
                className="leaflet-body font-body text-base leading-6 font-normal text-sparkles-navy"
                dangerouslySetInnerHTML={{ __html: story.body }}
              />
            ) : (
              <div className="font-body text-base leading-6 font-normal text-sparkles-navy">
                <p className="mb-4">
                  This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does
                  not aim to convince, it simply marks the rhythm of where real words will eventually go. Like bones under
                  the skin, this placeholder creates a frame that can stand without flesh.
                </p>
                <p className="mb-4">&zwj;</p>
                <h2 className="mb-3 mt-4 font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
                  Headline skeleton placeholder
                </h2>
                <p className="mb-4">
                  This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does
                  not aim to convince, it simply marks the rhythm of where real words will eventually go. Like bones under
                  the skin, this placeholder creates a frame that can stand without flesh. It stretches across the page,
                  line after line, showing flow, hierarchy, and balance.
                </p>
                <p className="mb-4">
                  You can read it or ignore it, because its only job is to hold the silence. Imagine this copy as
                  scaffolding: strong, temporary, replaceable. Each sentence arrives without purpose, except to suggest
                  weight and movement in the layout. The words lean forward, repeating, echoing, circling around
                  themselves. They are not here to tell a story, only to show where a story could be told.
                </p>
                <figure className="mb-4 w-full">
                  <img
                    loading="lazy"
                    src="https://byqsupply-components.netlify.app/skeletons/cms-page/images/patter-horizontal-new.svg"
                    alt=""
                    className="w-full rounded-xl"
                  />
                </figure>
                <p className="mb-4">&zwj;</p>
                <h2 className="mb-3 mt-4 font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
                  Headline skeleton placeholder
                </h2>
                <p className="mb-4">
                  This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does
                  not aim to convince, it simply marks the rhythm of where real words will eventually go. Like bones under
                  the skin, this placeholder creates a frame that can stand without flesh.
                </p>
                <p className="mb-4">&zwj;</p>
                <h2 className="mb-3 mt-4 font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
                  Headline skeleton placeholder
                </h2>
                <p className="mb-4">
                  This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does
                  not aim to convince, it simply marks the rhythm of where real words will eventually go. Like bones under
                  the skin, this placeholder creates a frame that can stand without flesh. It stretches across the page,
                  line after line, showing flow, hierarchy, and balance.
                </p>
                <p className="mb-4">
                  You can read it or ignore it, because its only job is to hold the silence. Imagine this copy as
                  scaffolding: strong, temporary, replaceable. Each sentence arrives without purpose, except to suggest
                  weight and movement in the layout. The words lean forward, repeating, echoing, circling around
                  themselves. They are not here to tell a story, only to show where a story could be told.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-sparkles-cream">
        <div className="px-8 max-[767px]:px-4">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="py-20 max-[767px]:py-16">
              <div className="mb-8 mr-auto h-0 w-full border-b border-sparkles-navy/16" />

              <div className="mb-16 flex flex-col items-start justify-start gap-4">
                <SectionLabel>{relatedStories ? "Keep reading" : "Label placeholder"}</SectionLabel>
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  {relatedStories ? "More from The Leaflet" : "Headline skeleton placeholder"}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-16 max-[479px]:grid-cols-1">
                {relatedStories
                  ? relatedStories.map((card) => (
                      <Link
                        key={card.slug}
                        href={`/leaflet/template/${card.slug}`}
                        className="flex w-full flex-col gap-4 text-sparkles-navy no-underline"
                      >
                        <div className="relative h-[25rem] w-full overflow-hidden rounded-2xl max-[991px]:h-[18.75rem] max-[767px]:h-[15.625rem] max-[479px]:h-[12.5rem] max-[479px]:rounded-lg">
                          <ParallaxImage src={card.image ?? skeletonHeroImage} alt="" />
                        </div>

                        <div className="flex flex-col items-start justify-start gap-3">
                          <div className="flex flex-wrap items-stretch justify-start gap-2">
                            <SectionLabel>{card.type}</SectionLabel>
                          </div>
                          <div className="font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
                            {card.title}
                          </div>
                        </div>
                      </Link>
                    ))
                  : skeletonRelatedCards.map((card) => (
                      <a
                        key={card.img}
                        href={card.href}
                        className="flex w-full flex-col gap-4 text-sparkles-navy no-underline"
                      >
                        <div className="relative h-[25rem] w-full overflow-hidden rounded-2xl max-[991px]:h-[18.75rem] max-[767px]:h-[15.625rem] max-[479px]:h-[12.5rem] max-[479px]:rounded-lg">
                          <ParallaxImage src={card.img} alt="" />
                        </div>

                        <div className="flex flex-col items-start justify-start gap-3">
                          <div className="flex flex-wrap items-stretch justify-start gap-2">
                            <SectionLabel>{card.label}</SectionLabel>
                          </div>
                          <div className="font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
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
    </div>
  );
}

export default CmsPageSection;

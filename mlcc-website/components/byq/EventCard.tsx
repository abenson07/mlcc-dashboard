"use client";

import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";
import type { Event } from "@marketing/data/events";
import { getEventPageHref } from "@marketing/data/events";

function ArrowLeftIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.5 15L7.5 10L12.5 5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.5 5L12.5 10L7.5 15"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EventImageSlider({ images }: { images: string[] }) {
  const [slide, setSlide] = React.useState(0);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [stepPx, setStepPx] = React.useState(0);
  const hasMultiple = images.length > 1;

  React.useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      const card = trackRef.current.firstElementChild as HTMLElement | null;
      if (!card) return;
      setStepPx(card.offsetWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [images.length]);

  const goLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSlide((prev) => Math.max(0, prev - 1));
  };

  const goRight = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSlide((prev) => Math.min(images.length - 1, prev + 1));
  };

  return (
    <div className="absolute inset-0 h-full w-full bg-transparent">
      <div className="h-full w-full overflow-hidden">
        <div
          ref={trackRef}
          className="flex h-full"
          style={{
            transform: hasMultiple ? `translateX(-${slide * stepPx}px)` : undefined,
            transition: hasMultiple ? "transform 500ms ease" : undefined,
          }}
        >
          {images.map((src, i) => (
            <div key={src + i} className="h-full w-full shrink-0">
              <img loading="lazy" src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goLeft}
            className="absolute left-0 top-1/2 z-10 ml-5 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-white/65 text-sparkles-navy backdrop-blur-md"
            aria-label="Previous image"
          >
            <span className="flex h-4 w-4 items-center justify-center">
              <ArrowLeftIcon />
            </span>
          </button>

          <button
            type="button"
            onClick={goRight}
            className="absolute right-0 top-1/2 z-10 mr-5 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-white/65 text-sparkles-navy backdrop-blur-md"
            aria-label="Next image"
          >
            <span className="flex h-4 w-4 items-center justify-center">
              <ArrowRightIcon />
            </span>
          </button>
        </>
      )}
    </div>
  );
}

export type EventCardProps = {
  event: Event;
  images?: string[];
  className?: string;
  asLink?: boolean;
  layout?: "vertical" | "horizontal";
};

function EventMeta({ event }: { event: Event }) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="font-display text-2xl font-bold leading-7 tracking-[-0.031rem] text-puget-night max-[767px]:text-xl max-[767px]:leading-6">
          {event.title}
        </div>
        <div className="font-body text-base leading-6 text-sparkles-navy">
          <span>{event.locationName}</span>
          <span className="px-2">·</span>
          <span>{event.category}</span>
        </div>
      </div>
    </>
  );
}

export function EventCard({
  event,
  images,
  className = "",
  asLink = true,
  layout = "vertical",
}: EventCardProps) {
  const imageSources = images ?? [event.image];
  const pageHref = getEventPageHref(event);

  const imageBlock = (
    <div
      className={
        layout === "horizontal"
          ? "relative h-[10.5rem] w-[15.5rem] shrink-0 overflow-hidden rounded-2xl max-[767px]:h-[12rem] max-[767px]:w-full"
          : "relative h-[22.5rem] overflow-hidden rounded-2xl max-[479px]:h-[17rem]"
      }
    >
      <div className="absolute left-3 top-3 z-10">
        <SectionLabel>{event.date}</SectionLabel>
      </div>
      <EventImageSlider images={imageSources} />
    </div>
  );

  const content =
    layout === "horizontal" ? (
      <>
        {imageBlock}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 py-1">
          <EventMeta event={event} />
        </div>
      </>
    ) : (
      <>
        {imageBlock}
        <div className="flex flex-col gap-2">
          <EventMeta event={event} />
        </div>
      </>
    );

  const rootClassName =
    layout === "horizontal"
      ? `flex w-full gap-6 text-sparkles-navy max-[767px]:flex-col ${className}`.trim()
      : `flex w-full flex-col gap-4 text-sparkles-navy ${className}`.trim();

  if (asLink) {
    return (
      <a href={pageHref} className={`${rootClassName} no-underline`}>
        {content}
      </a>
    );
  }

  return <div className={rootClassName}>{content}</div>;
}

export default EventCard;

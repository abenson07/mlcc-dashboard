"use client";

import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import {
  formatEventTime,
  getEventDetailBlocks,
  getEventMapEmbedUrl,
  getEventPageHref,
  getRelatedEvents,
  type Event,
  type EventDetailBlock,
} from "@marketing/data/events";

const detailLabelClassName =
  "mb-2 font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy";

function LocationIcon() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function getEventActionLabel(event: Event): string {
  if (event.external) {
    return "View event";
  }

  return "Get directions";
}

function renderEventBody(blocks: EventDetailBlock[]) {
  return (
    <div className="font-body text-sparkles-navy">
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          if (block.size === "h6") {
            return (
              <h6
                key={index}
                className="mb-3 mt-4 font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night"
              >
                {block.text}
              </h6>
            );
          }

          return (
            <h2
              key={index}
              className="mb-3 mt-4 font-display text-[1.75rem] leading-8 font-bold tracking-[-0.0625rem] text-puget-night"
            >
              {block.text}
            </h2>
          );
        }

        if (block.kind === "list") {
          return (
            <ul key={index} className="mb-4 list-disc pl-6" role="list">
              {block.items.map((item) => (
                <li key={item} className="text-base leading-6">
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="mb-4 text-base leading-6">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

function renderSkeletonBody() {
  return (
    <div className="font-body text-base leading-6 font-normal text-sparkles-navy">
      <p className="mb-4">
        This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim
        to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin, this
        placeholder creates a frame that can stand without flesh.
      </p>
      <p className="mb-4">&zwj;</p>
      <h2 className="mb-3 mt-4 font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
        Headline skeleton placeholder
      </h2>
      <p className="mb-4">
        This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim
        to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin, this
        placeholder creates a frame that can stand without flesh.
      </p>
    </div>
  );
}

function EventDetailsCard({ event }: { event: Event }) {
  const actionLabel = getEventActionLabel(event);

  return (
    <div className="sticky top-[7.5rem] flex w-full max-w-[28rem] flex-col gap-6 rounded-2xl bg-sparkles-warm p-8 max-[991px]:max-w-none max-[991px]:justify-self-start max-[767px]:w-full">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className={detailLabelClassName}>Date</div>
          <div className="font-body text-base leading-6 text-sparkles-navy">{event.date}</div>
        </div>

        <div>
          <div className={detailLabelClassName}>Time</div>
          <div className="font-body text-base leading-6 text-sparkles-navy">{formatEventTime(event.dateIso)}</div>
        </div>
      </div>

      <div>
        <div className={detailLabelClassName}>Location</div>
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-sparkles-navy">
            <LocationIcon />
          </span>
          <span className="font-body text-base leading-6 text-sparkles-navy">{event.locationName}</span>
        </div>
      </div>

      <div className="h-48 w-full overflow-hidden rounded-xl">
        <iframe
          title={`Map for ${event.locationName}`}
          src={getEventMapEmbedUrl(event)}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <a
        href={event.href}
        className="inline-flex w-full items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm font-bold leading-5 text-sparkles-cream no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
        {...(event.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {actionLabel}
      </a>
    </div>
  );
}

export function CmsPage12Section({
  title,
  event,
  currentSlug,
}: {
  title: string;
  event?: Event;
  currentSlug?: string;
}) {
  const relatedEvents = getRelatedEvents(currentSlug);
  const heroImage = event?.image;

  return (
    <div
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="events.cms-page"
      data-editable-label="Events CMS Page"
    >
      <section className="bg-sparkles-cream">
        <div className="px-8 max-[767px]:px-4">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="py-20 max-[767px]:py-16">
              <div className="mb-16 flex flex-col items-start gap-12">
                <Link
                  href="/events"
                  className="flex flex-row items-center gap-1 font-body text-base leading-[125%] text-sparkles-navy no-underline"
                >
                  <span className="flex h-5 w-5 flex-none items-center justify-center">
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 10H5M5 10L10 5M5 10L10 15"
                        stroke="currentColor"
                        strokeWidth="1px"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{event ? "All events" : "Label placeholder"}</span>
                </Link>

                <div className="mx-auto flex max-w-[42.5rem] flex-col items-center justify-start gap-6 text-center max-[479px]:gap-4">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <SectionLabel>{event?.date ?? "Label"}</SectionLabel>
                    <SectionLabel>{event?.category ?? "Label"}</SectionLabel>
                  </div>
                  <h1 className="m-0 font-display text-[3.75rem] leading-16 font-bold tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                    {title}
                  </h1>
                </div>
              </div>

              {heroImage ? (
                <div className="h-[30rem] w-full overflow-hidden rounded-2xl max-[991px]:h-[22.5rem] max-[767px]:h-[18.75rem] max-[479px]:h-[15.6rem]">
                  <img
                    loading="lazy"
                    src={heroImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1800px] pb-20 max-[767px]:pb-16">
            <div className="grid grid-cols-2 items-start justify-items-end gap-4 max-[991px]:grid-cols-1 max-[991px]:gap-16">
              <div className="flex w-full max-w-[42.5rem] flex-col justify-self-start max-[991px]:max-w-none max-[767px]:max-w-none">
                {event ? renderEventBody(getEventDetailBlocks(event)) : renderSkeletonBody()}
              </div>

              {event ? <EventDetailsCard event={event} /> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sparkles-cream">
        <div className="px-8 max-[767px]:px-4">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="py-20 max-[767px]:py-16">
              <div className="mb-8 mr-auto h-0 w-full border-b border-sparkles-navy/16" />

              <div className="mb-16 flex flex-col items-start justify-start gap-4">
                <SectionLabel>{relatedEvents.length > 0 ? "Upcoming" : "Label placeholder"}</SectionLabel>
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  {relatedEvents.length > 0 ? "More events" : "Headline skeleton placeholder"}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-16 max-[479px]:grid-cols-1">
                {relatedEvents.length > 0
                  ? relatedEvents.map((relatedEvent) => (
                      <Link
                        key={relatedEvent.slug}
                        href={getEventPageHref(relatedEvent)}
                        className="flex w-full flex-col gap-4 text-sparkles-navy no-underline"
                      >
                        <div className="relative h-[25rem] w-full overflow-hidden rounded-2xl max-[991px]:h-[18.75rem] max-[767px]:h-[15.625rem] max-[479px]:h-[12.5rem] max-[479px]:rounded-lg">
                          <img
                            loading="lazy"
                            src={relatedEvent.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute left-3 top-3 z-10">
                            <SectionLabel>{relatedEvent.date}</SectionLabel>
                          </div>
                        </div>

                        <div className="flex flex-row items-center justify-between gap-5 max-[767px]:flex-col max-[767px]:items-start max-[767px]:justify-between">
                          <div className="font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
                            {relatedEvent.title}
                          </div>
                          <div className="flex flex-wrap items-stretch justify-end gap-2">
                            <SectionLabel>{relatedEvent.category}</SectionLabel>
                          </div>
                        </div>
                      </Link>
                    ))
                  : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CmsPage12Section;

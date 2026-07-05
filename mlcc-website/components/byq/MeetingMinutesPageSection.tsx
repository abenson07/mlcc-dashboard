"use client";

import Link from "next/link";
import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";
import {
  formatMeetingDateTime,
  formatMeetingMinutesTitle,
  getCommitteeLabel,
  getMeetingMinutesDetailBlocks,
  getMeetingMinutesHref,
  getRelatedMeetingMinutes,
  type MeetingMinutesDetailBlock,
  type MeetingMinutesEntry,
} from "@marketing/data/meeting-minutes";

const skeletonRelatedEntries = [
  {
    slug: "skeleton-1",
    title: "January Advocacy Notes",
    dateLabel: "January 14, 2026 · 7:00 PM",
    committeeLabel: "Advocacy",
    href: "/meeting-minutes/template",
  },
  {
    slug: "skeleton-2",
    title: "January Events Notes",
    dateLabel: "January 21, 2026 · 6:30 PM",
    committeeLabel: "Events",
    href: "/meeting-minutes/template",
  },
];

function renderMinutesBody(blocks: MeetingMinutesDetailBlock[]) {
  return (
    <div className="font-body text-sparkles-navy">
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          return (
            <h2
              key={index}
              className="mb-3 mt-4 font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night"
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
        placeholder creates a frame that can stand without flesh. It stretches across the page, line after line, showing
        flow, hierarchy, and balance.
      </p>
      <p className="mb-4">
        You can read it or ignore it, because its only job is to hold the silence. Imagine this copy as scaffolding:
        strong, temporary, replaceable. Each sentence arrives without purpose, except to suggest weight and movement in
        the layout.
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
      <p className="mb-4">&zwj;</p>
      <h2 className="mb-3 mt-4 font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
        Headline skeleton placeholder
      </h2>
      <p className="mb-4">
        This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim
        to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin, this
        placeholder creates a frame that can stand without flesh. It stretches across the page, line after line, showing
        flow, hierarchy, and balance.
      </p>
      <p className="mb-4">
        You can read it or ignore it, because its only job is to hold the silence. Imagine this copy as scaffolding:
        strong, temporary, replaceable. Each sentence arrives without purpose, except to suggest weight and movement in
        the layout.
      </p>
    </div>
  );
}

function RelatedMinutesCard({
  title,
  dateLabel,
  committeeLabel,
  href,
  hovered,
  onMouseEnter,
  onMouseLeave,
}: {
  title: string;
  dateLabel: string;
  committeeLabel: string;
  href: string;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <Link
      href={href}
      className="flex w-full flex-col gap-6 rounded-2xl border border-sparkles-navy/16 bg-sparkles-warm/40 p-8 text-sparkles-navy no-underline transition-colors duration-300 hover:bg-sparkles-warm max-[479px]:p-6"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex flex-col gap-4">
        <p className="m-0 font-body text-xs leading-4 font-bold tracking-[0.047rem] text-sparkles-navy uppercase">
          {dateLabel}
        </p>
        <div className="font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
          {title}
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-5 max-[767px]:flex-col max-[767px]:items-start">
        <SectionLabel>{committeeLabel}</SectionLabel>
        <div
          className={`
            inline-flex shrink-0 items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3
            font-display text-sm leading-5 font-bold text-sparkles-cream
            transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
            ${hovered ? "border-sparkles-navy/90 bg-sparkles-navy/90" : ""}
          `}
        >
          View minutes
        </div>
      </div>
    </Link>
  );
}

export function MeetingMinutesPageSection({
  title,
  entry,
  currentSlug,
}: {
  title: string;
  entry?: MeetingMinutesEntry;
  currentSlug?: string;
}) {
  const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);
  const relatedMinutes = currentSlug ? getRelatedMeetingMinutes(currentSlug) : [];
  const showRelated = entry ? relatedMinutes.length > 0 : true;

  return (
    <div
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="meeting-minutes.page"
      data-editable-label="Meeting Minutes Page"
    >
      <section className="bg-sparkles-cream">
        <div className="px-8 max-[767px]:px-4">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="py-20 max-[767px]:py-16">
              <div className="mx-auto mb-16 flex max-w-[42.5rem] flex-col items-center justify-start gap-6 text-center max-[479px]:gap-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <SectionLabel>{entry ? getCommitteeLabel(entry.committeeSlug) : "Label"}</SectionLabel>
                  {entry ? (
                    <SectionLabel>{formatMeetingDateTime(entry.dateIso)}</SectionLabel>
                  ) : (
                    <SectionLabel>More Label</SectionLabel>
                  )}
                </div>
                <h1 className="m-0 font-display text-[3.75rem] leading-16 font-bold tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                  {title}
                </h1>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[35.25rem] max-[991px]:w-full max-[991px]:max-w-none">
            {entry ? renderMinutesBody(getMeetingMinutesDetailBlocks(entry)) : renderSkeletonBody()}
          </div>
        </div>
      </section>

      {showRelated ? (
        <section className="bg-sparkles-cream">
          <div className="px-8 max-[767px]:px-4">
            <div className="mx-auto w-full max-w-[1800px]">
              <div className="py-20 max-[767px]:py-16">
                <div className="mb-8 mr-auto h-0 w-full border-b border-sparkles-navy/16" />

                <div className="mb-16 flex flex-col items-start justify-start gap-4">
                  <SectionLabel>{entry ? "More minutes" : "Label placeholder"}</SectionLabel>
                  <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                    {entry ? "Other meeting minutes" : "Headline skeleton placeholder"}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-16 max-[479px]:grid-cols-1">
                  {entry
                    ? relatedMinutes.map((relatedEntry, i) => (
                        <RelatedMinutesCard
                          key={relatedEntry.slug}
                          title={formatMeetingMinutesTitle(relatedEntry)}
                          dateLabel={formatMeetingDateTime(relatedEntry.dateIso)}
                          committeeLabel={getCommitteeLabel(relatedEntry.committeeSlug)}
                          href={getMeetingMinutesHref(relatedEntry)}
                          hovered={hoveredCard === i}
                          onMouseEnter={() => setHoveredCard(i)}
                          onMouseLeave={() => setHoveredCard(null)}
                        />
                      ))
                    : skeletonRelatedEntries.map((card, i) => (
                        <RelatedMinutesCard
                          key={card.slug}
                          title={card.title}
                          dateLabel={card.dateLabel}
                          committeeLabel={card.committeeLabel}
                          href={card.href}
                          hovered={hoveredCard === i}
                          onMouseEnter={() => setHoveredCard(i)}
                          onMouseLeave={() => setHoveredCard(null)}
                        />
                      ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default MeetingMinutesPageSection;

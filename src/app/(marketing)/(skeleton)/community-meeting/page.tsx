import type { Metadata } from "next";
import { CtaSection } from "@marketing/components/byq/CtaSection";
import { SectionLabel } from "@marketing/components/SectionLabel";
import {
  communityMeetingLivestream as meeting,
  getLivestreamEmbedUrl,
  type LivestreamBodyBlock,
} from "@marketing/data/livestream";

export const metadata: Metadata = {
  title: `${meeting.title} | Maple Leaf Community Council`,
  description: `Watch the live stream of the Maple Leaf Community Council's ${meeting.title}.`,
};

function renderBody(blocks: LivestreamBodyBlock[]) {
  return blocks.map((block, index) => {
    if (block.kind === "heading") {
      return (
        <h2
          key={index}
          className="mb-3 mt-8 font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night"
        >
          {block.text}
        </h2>
      );
    }

    if (block.kind === "list") {
      return (
        <ul key={index} className="mb-4 list-disc pl-6" role="list">
          {block.items.map((item, i) => (
            <li key={i} className="text-base leading-6">
              {typeof item === "string" ? (
                item
              ) : (
                <a
                  href={item.href}
                  {...(item.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="font-bold text-sparkles-navy underline"
                >
                  {item.text}
                </a>
              )}
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
  });
}

export default function CommunityMeetingPage() {
  return (
    <main>
      <section className="bg-sparkles-cream text-sparkles-navy">
        <div className="px-8 max-[767px]:px-4">
          <div className="mx-auto w-full max-w-[1800px] py-20 max-[767px]:py-16">
            <div className="mx-auto mb-12 flex max-w-[42.5rem] flex-col items-center gap-6 text-center max-[479px]:gap-4">
              <SectionLabel>Live stream</SectionLabel>
              <h1 className="m-0 font-display text-[3.75rem] leading-16 font-bold tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                {meeting.title}
              </h1>
              <p className="m-0 font-body text-xl leading-7 text-sparkles-muted max-[767px]:text-base max-[767px]:leading-6">
                {meeting.dateLabel}
              </p>
            </div>

            <div className="mx-auto mb-16 w-full max-w-[60rem] overflow-hidden rounded-[1.25rem] bg-sparkles-navy max-[767px]:mb-12">
              <div className="relative aspect-video w-full">
                <iframe
                  src={getLivestreamEmbedUrl(meeting.youtubeId)}
                  title={`${meeting.title} live stream`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="mx-auto max-w-[35.25rem] font-body text-sparkles-navy max-[991px]:max-w-none">
              {renderBody(meeting.body)}
              <p className="mb-4 text-base leading-6">
                <a href={meeting.youtubeUrl} target="_blank" rel="noreferrer" className="font-bold text-sparkles-navy">
                  Open on YouTube
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
      <CtaSection />
    </main>
  );
}

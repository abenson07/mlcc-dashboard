"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
const cards = [
  {
    image: "https://byqsupply-components.netlify.app/skeletons/team-grid/images/vertical-pattern-2.svg",
    name: "Jessy Skeleton",
    role: "CEO",
  },
  {
    image: "https://byqsupply-components.netlify.app/skeletons/team-grid/images/patter-horizontal-new.svg",
    name: "Mark Bonefield",
    role: "Pixel Skeleton",
  },
  {
    image: "https://byqsupply-components.netlify.app/skeletons/team-grid/images/horizontal-pattern-2.svg",
    name: "Eddie Marrow",
    role: "Placeholder Hero",
  },
  {
    image: "https://byqsupply-components.netlify.app/skeletons/team-grid/images/pattern-vertical-new.svg",
    name: "Jessy Skeleton",
    role: "Wireframe Architect",
  },
  {
    image: "https://byqsupply-components.netlify.app/skeletons/team-grid/images/vertical-pattern-2.svg",
    name: "Mark Bonefield",
    role: "Pixel Skeleton",
  },
  {
    image: "https://byqsupply-components.netlify.app/skeletons/team-grid/images/horizontal-pattern-2.svg",
    name: "Clara Holloway",
    role: "Layout Surgeon",
  },
  {
    image: "https://byqsupply-components.netlify.app/skeletons/team-grid/images/pattern-vertical-new.svg",
    name: "Jessy Morales",
    role: "Branding Strategist",
  },
];

function TeamCard({ card }: { card: (typeof cards)[number] }) {
  return (
    <div className="flex w-[26rem] flex-none flex-col gap-4 max-[991px]:w-[21rem] max-[767px]:w-[20rem] max-[479px]:w-[13.75rem]">
      <div className="h-[33rem] w-full overflow-hidden rounded-xl bg-sparkles-warm max-[991px]:h-[23.4rem] max-[479px]:h-[17.5rem]">
        <img src={card.image} loading="lazy" alt="" className="z-[1] h-full w-full object-cover" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
          {card.name}
        </div>
        <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy/50">
          {card.role}
        </div>
      </div>
    </div>
  );
}

export function Team4Section({
  image,
  label = "Committee Volunteers",
  headline = "Run by neighbors like you",
  body = "This committee is powered entirely by volunteers, neighbors who live right here in Maple Leaf and give their time because they care about the community. There's always room for another familiar face.",
  editableId = "template.team-4",
  editableLabel = "Team 4 (Template)",
}: {
  image?: string;
  label?: string;
  headline?: string;
  body?: string;
  editableId?: string;
  editableLabel?: string;
}) {
  return (
    <section
      className="bg-sparkles-cream py-[7.5rem] max-[767px]:py-20"
      data-editable="true"
      data-editable-type="section"
      data-editable-id={editableId}
      data-editable-label={editableLabel}
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="grid w-full items-center gap-12 [grid-template-columns:1fr_1fr] max-[991px]:[grid-template-columns:1fr]">
            <div className="flex max-w-[42.5rem] flex-col items-start gap-6">
              <SectionLabel>{label}</SectionLabel>
              <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                {headline}
              </h2>
              <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">{body}</p>
            </div>

            <div className="h-[24rem] w-full overflow-hidden rounded-3xl bg-[var(--sparkles-navy-16)] max-[767px]:h-[18rem]">
              {image ? <img loading="lazy" src={image} alt="" className="h-full w-full object-cover" /> : null}
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer marquee — hidden per request, kept for possible future use.
      <style>{`
        @keyframes team-4-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-team-4-marquee {
          animation: team-4-marquee 30s linear infinite;
        }
      `}</style>
      <div className="overflow-hidden">
        <div className="animate-team-4-marquee flex w-max gap-4">
          <div className="flex flex-none gap-4">
            {cards.map((card, i) => (
              <TeamCard key={`a-${i}`} card={card} />
            ))}
          </div>
          <div className="flex flex-none gap-4">
            {cards.map((card, i) => (
              <TeamCard key={`b-${i}`} card={card} />
            ))}
          </div>
        </div>
      </div>
      */}
    </section>
  );
}

export default Team4Section;

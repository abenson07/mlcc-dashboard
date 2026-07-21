import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";

const resources = [
  {
    title: "About the board",
    description:
      "Meet current board members, learn about officer roles, and understand how elections and terms work.",
    href: "/board",
    cta: "View the board page",
    image:
      "/images/community-photos/community-meeting-a.webp",
  },
  {
    title: "Meeting minutes",
    description:
      "Read what the board and steering committee have discussed, a transparent look at how decisions get made.",
    href: "/meeting-minutes",
    cta: "Browse meeting minutes",
    image:
      "/images/community-photos/community-meeting-d.webp",
  },
  {
    title: "Start with a committee",
    description:
      "Many board members began by volunteering on a committee. It's a natural way to learn how the council works before taking on a leadership role.",
    href: "/committees",
    cta: "Explore committees",
    image:
      "/images/leaflet/leaflet.webp",
  },
  {
    title: "Volunteer opportunities",
    description:
      "Not ready for the board yet? There are open roles across the neighborhood, from event support to newsletter delivery.",
    href: "/volunteer",
    cta: "See volunteer openings",
    image:
      "/images/community-photos/summer-social-2024-62.webp",
  },
] as const;

function ResourceCard({
  title,
  description,
  href,
  cta,
  image,
}: (typeof resources)[number]) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-sparkles-warm">
      <div className="aspect-[16/10] w-full overflow-hidden">
        <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-8 max-[767px]:p-6">
        <div className="flex flex-col gap-2">
          <h3 className="m-0 font-display text-[1.75rem] font-bold leading-8 tracking-[-0.03125rem] text-puget-night">
            {title}
          </h3>
          <p className="m-0 font-body text-base leading-6 text-sparkles-navy">{description}</p>
        </div>
        <div className="mt-auto">
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm font-bold leading-5 text-sparkles-cream no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
          >
            {cta}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function JoinBoardLearnMoreSection() {
  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="join-the-board.learn-more"
      data-editable-label="Join The Board Learn More"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-16 flex max-w-[42.5rem] flex-col items-start gap-6 max-[767px]:mb-12">
              <SectionLabel>Go deeper</SectionLabel>
              <h2 className="m-0 font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                Want the full picture?
              </h2>
              <p className="m-0 font-body text-xl leading-7 font-normal text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                This page is a starting point. If you want to know who&apos;s serving now, how
                meetings work, or where to plug in before considering the board, these are good next
                steps.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-[991px]:grid-cols-1">
              {resources.map((resource) => (
                <ResourceCard key={resource.title} {...resource} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default JoinBoardLearnMoreSection;

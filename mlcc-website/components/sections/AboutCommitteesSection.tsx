import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { COMMITTEE_CONTENT, COMMITTEE_LISTINGS } from "@marketing/data/committees";

function CommitteeCard({
  title,
  href,
  description,
  image,
}: {
  title: string;
  href: string;
  description: string;
  image: string;
}) {
  return (
    <Link href={href} className="group block w-full text-inherit no-underline">
      <div className="flex flex-col gap-4">
        <div className="relative h-[22.5rem] overflow-hidden rounded-2xl max-[479px]:h-[17rem]">
          <img
            loading="lazy"
            src={image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="font-display text-2xl font-bold leading-7 tracking-[-0.03125rem] text-puget-night group-hover:underline">
            {title}
          </div>
          <p className="m-0 line-clamp-2 font-body text-sm leading-5 text-sparkles-navy">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function AboutCommitteesSection() {
  return (
    <section
      className="bg-sparkles-warm text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="about.committees"
      data-editable-label="About Committees"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-16 flex flex-col items-start gap-6 max-[767px]:mb-12">
              <SectionLabel>Committees</SectionLabel>
              <h2 className="m-0 max-w-[42.5rem] font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                How neighbors get the work done
              </h2>
              <p className="m-0 max-w-[34rem] font-body text-base leading-6 text-sparkles-navy">
                Committees are the engine of the council: events, the newsletter, advocacy,
                communications, emergency preparedness, and local business. Each team is run by
                volunteers. No special résumé required.
              </p>
              <Link
                href="/committees"
                className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm font-bold leading-5 text-sparkles-cream no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
              >
                Explore all committees
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 max-[991px]:grid-cols-2 max-[767px]:grid-cols-1 max-[479px]:gap-6">
              {COMMITTEE_LISTINGS.map((committee) => (
                <CommitteeCard
                  key={committee.slug}
                  title={COMMITTEE_CONTENT[committee.slug].title}
                  href={`/committees/${committee.slug}`}
                  description={committee.description}
                  image={committee.image}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutCommitteesSection;

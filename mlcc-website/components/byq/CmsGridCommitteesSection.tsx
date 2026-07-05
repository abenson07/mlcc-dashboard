import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { COMMITTEE_CONTENT, COMMITTEE_LISTINGS } from "@marketing/data/committees";

function Card({
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
    <Link
      href={href}
      className="group block w-full text-inherit no-underline"
    >
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

export function CmsGridCommitteesSection() {
  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="committees.cms-grid"
      data-editable-label="Committees CMS Grid"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="pt-20 pb-[7.5rem] max-[767px]:pt-16 max-[767px]:pb-20">
            <div className="flex flex-col items-center justify-start gap-12 max-[767px]:gap-10">
              <div className="flex flex-col items-center justify-start gap-6 text-center max-[479px]:items-start max-[479px]:justify-start max-[479px]:text-left">
                <SectionLabel>committees</SectionLabel>

                <h2 className="m-0 font-display text-5xl font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                  It&apos;s your neighborhood. Shape it the way you want it.
                </h2>
              </div>

              <div className="w-full">
                <div className="grid grid-cols-3 gap-8 max-[991px]:grid-cols-2 max-[767px]:grid-cols-1 max-[479px]:gap-6">
                  {COMMITTEE_LISTINGS.map((committee) => (
                    <Card
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
        </div>
      </div>
    </section>
  );
}

export default CmsGridCommitteesSection;

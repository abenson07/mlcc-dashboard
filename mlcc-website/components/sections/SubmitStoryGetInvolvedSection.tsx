import Link from "next/link";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { COMMITTEE_CONTENT, COMMITTEE_LISTINGS } from "@marketing/data/committees";

const committeeSlugs = ["newsletter", "communications"] as const;

function CommitteeCard({ slug }: { slug: (typeof committeeSlugs)[number] }) {
  const listing = COMMITTEE_LISTINGS.find((item) => item.slug === slug);
  const content = COMMITTEE_CONTENT[slug];

  if (!listing) return null;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-sparkles-warm">
      <div className="aspect-[16/10] w-full overflow-hidden">
        <img
          src={listing.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-8 max-[767px]:p-6">
        <div className="flex flex-col gap-2">
          <h3 className="m-0 font-display text-[1.75rem] font-bold leading-8 tracking-[-0.03125rem] text-puget-night">
            {content.title} Committee
          </h3>
          <p className="m-0 font-body text-base leading-6 text-sparkles-navy">{content.body}</p>
        </div>
        <div className="mt-auto flex flex-wrap gap-3">
          <Link
            href={`/committees/${slug}`}
            className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm font-bold leading-5 text-sparkles-cream no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
          >
            Learn about the committee
          </Link>
          <Link
            href="/volunteer"
            className="inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy/30 bg-white/50 px-4 py-3 font-display text-sm font-bold leading-5 text-sparkles-navy no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90 hover:text-sparkles-cream"
          >
            Volunteer
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SubmitStoryGetInvolvedSection() {
  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="submit-story.get-involved"
      data-editable-label="Submit Story Get Involved"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="mb-16 flex max-w-[42.5rem] flex-col items-start gap-6 max-[767px]:mb-12">
              <SectionLabel>Go deeper</SectionLabel>
              <h2 className="m-0 font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                Want to help beyond one story?
              </h2>
              <p className="m-0 font-body text-xl leading-7 font-normal text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                Submitting a story is a great first step. If you want to stay involved, the Newsletter
                and Communications committees are always looking for neighbors who care about keeping
                Maple Leaf informed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-[991px]:grid-cols-1">
              {committeeSlugs.map((slug) => (
                <CommitteeCard key={slug} slug={slug} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SubmitStoryGetInvolvedSection;

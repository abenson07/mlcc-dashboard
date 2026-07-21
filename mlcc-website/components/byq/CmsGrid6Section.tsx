import { SectionLabel } from "@marketing/components/SectionLabel";
import type { CommitteeSlug } from "@marketing/data/committees";
import { formatVolunteersNeeded, getVolunteerOpportunitiesByCommittee } from "@marketing/data/volunteers";

export function CmsGrid6Section({
  committee,
  body = "These are the roles we're hoping to fill right now. Each one is a chance to give a little time, meet people nearby, and help keep Maple Leaf connected.",
}: {
  committee?: CommitteeSlug;
  body?: string;
}) {
  const opportunities =
    committee && committee !== "template" ? getVolunteerOpportunitiesByCommittee(committee) : [];

  return (
    <section
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="template.cms-grid-6"
      data-editable-label="CMS Grid 6 (Template)"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div className="grid gap-8 [grid-template-columns:1fr_1.5fr] max-[767px]:grid-cols-1 max-[767px]:gap-16">
              <div className="flex flex-col items-start justify-start gap-6 max-[767px]:col-span-1">
                <SectionLabel>Get involved</SectionLabel>
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  Join your neighbors
                </h2>
                <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">{body}</p>
              </div>

              <div
                id="open-positions"
                className="flex flex-col gap-6 border-b border-sparkles-navy/16 pb-8 max-[767px]:col-span-1"
              >
                {opportunities.length === 0 ? (
                  <p className="m-0 border-t border-sparkles-navy/16 pt-8 font-body text-base leading-6 font-normal text-sparkles-navy">
                    We don&apos;t have specific open roles listed for this committee right now. Reach out above and
                    we&apos;ll find a way to plug you in.
                  </p>
                ) : (
                  opportunities.map((opportunity) => (
                    <div key={opportunity.slug} className="flex flex-col gap-4 border-t border-sparkles-navy/16 pt-8">
                      <div className="flex flex-wrap items-center justify-start gap-2">
                        <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                          {opportunity.timeCommitment}
                        </div>
                        <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                          |
                        </div>
                        <div className="font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy">
                          {formatVolunteersNeeded(opportunity.volunteersNeeded)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-end justify-between gap-6">
                        <div className="font-display text-[2rem] leading-10 font-bold tracking-[-0.0625rem] text-puget-night max-[767px]:text-[1.75rem] max-[767px]:leading-8">
                          {opportunity.title}
                        </div>
                        <a
                          href={`/volunteer/${opportunity.slug}`}
                          className="inline-flex shrink-0 items-center justify-center rounded-[2rem] border border-sparkles-navy/30 bg-white/50 px-4 py-3 font-display text-sm leading-5 font-bold text-puget-night no-underline transition-all duration-300 hover:border-white/10 hover:bg-sparkles-navy/90 hover:text-sparkles-cream"
                        >
                          Learn more
                        </a>
                      </div>

                      <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">
                        {opportunity.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CmsGrid6Section;

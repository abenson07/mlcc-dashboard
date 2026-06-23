"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import {
  filterVolunteerOpportunities,
  formatOpportunityMeta,
  VOLUNTEER_FILTERS,
  volunteerOpportunities,
  type VolunteerFilter,
} from "@marketing/data/volunteers";
import * as React from "react";

export function StructuredData4Section({ title }: { title: string }) {
  const [activeFilter, setActiveFilter] = React.useState<VolunteerFilter | null>(null);

  const visibleOpportunities = filterVolunteerOpportunities(volunteerOpportunities, activeFilter);

  function toggleFilter(filter: VolunteerFilter) {
    setActiveFilter((current) => (current === filter ? null : filter));
  }

  return (
    <section className="bg-sparkles-cream">
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-40 max-[767px]:py-20">
            <div className="flex flex-col items-center justify-start gap-20 max-[767px]:gap-12">
              <div className="text-center">
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  {title}
                </h2>
              </div>

              <div className="flex w-full max-w-[49.75rem] flex-col items-center gap-10 max-[767px]:max-w-none">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {VOLUNTEER_FILTERS.map((filter) => {
                    const isActive = activeFilter === filter.id;

                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => toggleFilter(filter.id)}
                        className={`
                          rounded-[2rem] border border-sparkles-navy/16 px-4 py-2
                          font-body text-sm leading-5 font-semibold
                          transition-colors duration-200 cursor-pointer outline-none
                          ${isActive ? "bg-sparkles-navy text-white" : "bg-transparent text-sparkles-navy hover:bg-sparkles-warm"}
                        `}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                <div className="relative w-full">
                  <div className="w-full border-t border-sparkles-navy/16">
                    {visibleOpportunities.length > 0 ? (
                      visibleOpportunities.map((item) => (
                        <div
                          key={item.slug}
                          className="flex items-start justify-between border-b border-sparkles-navy/16 py-8 max-[767px]:flex-wrap max-[767px]:gap-8 max-[479px]:flex-col"
                        >
                          <div className="flex flex-col items-start justify-start gap-4">
                            <div className="font-display text-[1.75rem] leading-8 font-bold tracking-[-0.0625rem] text-puget-night max-[767px]:text-[1.5rem] max-[767px]:leading-7">
                              {item.title}
                            </div>
                            <SectionLabel>{formatOpportunityMeta(item)}</SectionLabel>
                          </div>

                          <a
                            href={`/volunteer/${item.slug}`}
                            className="inline-flex shrink-0 items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm leading-5 font-bold text-sparkles-cream no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
                          >
                            Learn More
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="border-b border-sparkles-navy/16 py-12 text-center">
                        <p className="m-0 font-body text-base leading-6 text-sparkles-navy">
                          No volunteer opportunities match those filters yet. Try another category or clear your
                          selection.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StructuredData4Section;

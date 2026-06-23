"use client";

import type { VolunteerDetailContent } from "@marketing/data/volunteers";
import {
  formatOpportunityMeta,
  getRelatedVolunteerOpportunities,
  getVolunteerFilterLabel,
} from "@marketing/data/volunteers";

const inputClassName =
  "mb-3 min-h-12 w-full rounded-lg border border-sparkles-cream bg-white px-4 py-2 font-body text-base leading-6 text-sparkles-navy/90 placeholder:text-sparkles-muted focus:border-sparkles-navy focus:text-sparkles-navy focus:outline-none";

const labelClassName =
  "mb-2 font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy";

export function CmsPage6Section({
  title,
  detail,
  signupIdPrefix = "volunteer",
  currentSlug,
}: {
  title: string;
  detail?: VolunteerDetailContent;
  signupIdPrefix?: string;
  currentSlug?: string;
}) {
  const backLabel = detail?.backLabel ?? "label placeholder";
  const relatedOpportunities = getRelatedVolunteerOpportunities(currentSlug);

  function renderBody() {
    if (detail) {
      return (
        <div className="font-body text-sparkles-navy">
          {detail.blocks.map((block, index) => {
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
                <h5
                  key={index}
                  className="mb-3 mt-4 font-display text-[1.75rem] leading-8 font-bold tracking-[-0.0625rem] text-puget-night"
                >
                  {block.text}
                </h5>
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

    return (
      <div className="font-body text-sparkles-navy">
        <h5 className="mb-3 mt-4 font-display text-[1.75rem] leading-8 font-bold tracking-[-0.0625rem] text-puget-night">
          Headline skeleton placeholder
        </h5>
        <ul className="mb-4 list-disc pl-6" role="list">
          <li className="text-base leading-6">This is skeleton super short text.</li>
          <li className="text-base leading-6">This is skeleton super short text</li>
          <li className="text-base leading-6">This is skeleton super short text.</li>
        </ul>

        <p className="mb-4 text-base leading-6">&zwj;</p>

        <h6 className="mb-3 mt-4 font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-puget-night">
          This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim
          to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin,
          this placeholder creates a frame that can stand without flesh.
        </h6>

        <p className="mb-4 text-base leading-6">&zwj;</p>

        <h5 className="mb-3 mt-4 font-display text-[1.75rem] leading-8 font-bold tracking-[-0.0625rem] text-puget-night">
          Headline skeleton placeholder
        </h5>
        <p className="mb-4 text-base leading-6">
          This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim
          to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin,
          this placeholder creates a frame that can stand without flesh.
        </p>
        <p className="mb-4 text-base leading-6">
          This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim
          to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin,
          this placeholder creates a frame that can stand without flesh. It stretches across the page, line after line,
          showing flow, hierarchy, and balance. You can read it or ignore it, because its only job is to hold the
          silence. Imagine this copy as scaffolding: strong, temporary, replaceable. Each sentence arrives without
          purpose, except to suggest weight and movement in the layout. The words lean forward, repeating, echoing,
          circling around themselves. They are not here to tell a story, only to show where a story could be told.
        </p>

        <p className="mb-4 text-base leading-6">&zwj;</p>

        <h5 className="mb-3 mt-4 font-display text-[1.75rem] leading-8 font-bold tracking-[-0.0625rem] text-puget-night">
          Headline skeleton placeholder
        </h5>
        <ul className="mb-4 list-disc pl-6" role="list">
          <li className="text-base leading-6">This is skeleton super short text.</li>
          <li className="text-base leading-6">This is skeleton super short text</li>
          <li className="text-base leading-6">This is skeleton super short text.</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="overflow-clip bg-sparkles-cream text-sparkles-navy">
      <section>
        <div className="px-8 max-[767px]:px-4">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="py-[7.5rem] max-[767px]:py-20">
              <div className="grid grid-cols-2 items-start justify-items-end gap-4 max-[991px]:grid-cols-1 max-[991px]:gap-16">
                <div className="flex w-full max-w-[42.5rem] flex-col gap-16 justify-self-start max-[991px]:max-w-none max-[767px]:max-w-none">
                  <div className="flex flex-col items-start gap-12">
                    <a
                      href="/volunteer"
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
                      <span>{backLabel}</span>
                    </a>
                    <h1 className="m-0 font-display text-[3.75rem] leading-16 font-bold tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                      {title}
                    </h1>
                  </div>

                  {renderBody()}
                </div>

                <div className="sticky top-[7.5rem] flex w-full max-w-[28rem] flex-col gap-6 rounded-2xl bg-sparkles-warm p-8 max-[991px]:max-w-none max-[991px]:justify-self-start max-[767px]:w-full">
                  <form className="flex flex-col" aria-label={`Sign up for ${title}`}>
                    <div className="flex flex-col">
                      <label htmlFor={`${signupIdPrefix}-first-name`} className={labelClassName}>
                        First name
                      </label>
                      <input
                        className={inputClassName}
                        maxLength={256}
                        name="firstName"
                        placeholder="First name"
                        type="text"
                        id={`${signupIdPrefix}-first-name`}
                        autoComplete="given-name"
                        required
                      />
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor={`${signupIdPrefix}-last-name`} className={labelClassName}>
                        Last name
                      </label>
                      <input
                        className={inputClassName}
                        maxLength={256}
                        name="lastName"
                        placeholder="Last name"
                        type="text"
                        id={`${signupIdPrefix}-last-name`}
                        autoComplete="family-name"
                        required
                      />
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor={`${signupIdPrefix}-email`} className={labelClassName}>
                        Email
                      </label>
                      <input
                        className={inputClassName}
                        maxLength={256}
                        name="email"
                        placeholder="Email"
                        type="email"
                        id={`${signupIdPrefix}-email`}
                        autoComplete="email"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-1 w-full cursor-pointer rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm leading-5 font-bold text-sparkles-cream transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
                    >
                      I&apos;m interested
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {relatedOpportunities.length > 0 && (
        <section className="pb-[7.5rem] pt-20 max-[767px]:pb-20">
          <div className="px-8 max-[767px]:px-4">
            <div className="mx-auto w-full max-w-[1800px]">
              <div className="mb-20 flex flex-col items-start max-[767px]:mb-12 max-[479px]:mb-8">
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  Other volunteer opportunities
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-x-4 gap-y-16 max-[991px]:grid-cols-2 max-[479px]:grid-cols-1">
                {relatedOpportunities.map((opportunity) => (
                  <a
                    key={opportunity.slug}
                    href={`/volunteer/${opportunity.slug}`}
                    className="flex w-full flex-col gap-4 text-sparkles-navy no-underline"
                  >
                    <div className="relative h-60 w-full overflow-hidden rounded-lg">
                      <img
                        loading="lazy"
                        src={opportunity.image}
                        alt=""
                        className="z-10 h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-body text-xs leading-4 font-normal text-sparkles-navy">
                          {getVolunteerFilterLabel(opportunity.filters[0])}
                        </span>
                        <span className="font-body text-xs leading-4 font-normal text-sparkles-navy/50">·</span>
                        <span className="font-body text-xs leading-4 font-normal text-sparkles-navy">
                          {formatOpportunityMeta(opportunity)}
                        </span>
                      </div>
                      <div className="font-display text-[1.75rem] leading-8 font-bold tracking-[-0.0625rem] text-puget-night max-[767px]:text-[1.5rem] max-[767px]:leading-7">
                        {opportunity.title}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default CmsPage6Section;

"use client";

import * as React from "react";
import { getApiBase } from "@/lib/apiBase";
import { SectionLabel } from "@marketing/components/SectionLabel";
// import { TestimonialPanel, type TestimonialPanelProps } from "@marketing/components/byq/TestimonialPanel";

// const defaultTestimonial: TestimonialPanelProps = {
//   quote:
//     "Volunteering with MLCC connected me with neighbors I would never have met otherwise. It is the best way to feel at home in Maple Leaf.",
//   name: "Maple Leaf neighbor",
//   attribution: "Newsletter volunteer",
// };

const inputClassName =
  "mb-3 min-h-12 w-full rounded-lg border border-sparkles-warm bg-sparkles-cream px-4 py-2 font-body text-base leading-6 text-sparkles-navy/90 placeholder:text-sparkles-muted focus:border-sparkles-navy focus:outline-none";

const labelClassName =
  "mb-2 font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-navy";

export type ContactCtaPreFooterSectionProps = {
  // testimonial?: TestimonialPanelProps;
  image?: string;
  committeeName?: string;
  headline?: string;
  source?: string;
};

function formatCommitteeName(name: string): string {
  const trimmed = name.trim();
  if (/committee$/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed} committee`;
}

function getJoinCopy(committeeName?: string) {
  if (committeeName) {
    return {
      label: "Get involved",
      headline: "Attend the next committee meeting",
      description:
        "Share your name and email or phone and a committee lead will be in touch about volunteering.",
      button: "Request an invite",
      idPrefix: committeeName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    };
  }

  return {
    label: "Get involved",
    headline: "Join a committee",
    description:
      "Share your name and email or phone and a committee lead will be in touch about volunteering.",
    button: "Join the committee",
    idPrefix: "committee",
  };
}

export function ContactCtaPreFooterSection({
  // testimonial = defaultTestimonial,
  image,
  committeeName,
  headline,
  source = "join-card",
}: ContactCtaPreFooterSectionProps = {}) {
  const copy = { ...getJoinCopy(committeeName), ...(headline ? { headline } : {}) };
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("submitting");
    try {
      const response = await fetch(`${getApiBase()}/api/public/committees/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          contact: formData.get("contact"),
          committeeName,
          source,
          website: formData.get("website"),
        }),
      });

      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      id="join-committee"
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="one-seattle-plan.contact-cta"
      data-editable-label="Contact CTA Pre-Footer"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div
              className={`grid gap-16 rounded-2xl bg-sparkles-warm p-20 max-[479px]:p-12 ${
                image ? "[grid-template-columns:1.5fr_1fr] max-[991px]:grid-cols-1" : "grid-cols-1"
              }`}
            >
              <div>
                <SectionLabel>{copy.label}</SectionLabel>
                <div className="mb-8 mt-6 flex flex-col gap-6">
                  <div className="font-display text-[2.5rem] leading-[2.75rem] font-bold tracking-[-0.0625rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
                    {copy.headline}
                  </div>
                  <div className="font-body text-xl leading-7 font-normal text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                    {copy.description}
                  </div>
                </div>

                <form className="flex flex-col gap-0" aria-label={copy.headline} onSubmit={handleSubmit}>
                  <div className="flex flex-col">
                    <label htmlFor={`${copy.idPrefix}-name`} className={labelClassName}>
                      Name
                    </label>
                    <input
                      className={inputClassName}
                      maxLength={256}
                      name="name"
                      placeholder="Name"
                      type="text"
                      id={`${copy.idPrefix}-name`}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor={`${copy.idPrefix}-contact`} className={labelClassName}>
                      Email or phone
                    </label>
                    <input
                      className={inputClassName}
                      maxLength={256}
                      name="contact"
                      placeholder="Email or phone"
                      type="text"
                      id={`${copy.idPrefix}-contact`}
                      autoComplete="off"
                      required
                    />
                  </div>

                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}
                  />

                  <div className="mt-4 flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="cursor-pointer rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm leading-5 font-bold text-sparkles-cream transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === "submitting" ? "Sending…" : copy.button}
                    </button>
                    {status === "success" ? (
                      <span className="font-body text-sm text-sparkles-navy">Thanks! We&apos;ll be in touch!</span>
                    ) : null}
                    {status === "error" ? (
                      <span className="font-body text-sm text-red-700">
                        Something went wrong. Please try again.
                      </span>
                    ) : null}
                  </div>
                </form>
              </div>

              {/* <TestimonialPanel {...testimonial} /> */}
              {image ? (
                <div className="min-h-[400px] overflow-hidden rounded-lg max-[991px]:min-h-[300px]">
                  <img loading="lazy" src={image} alt="" className="h-full w-full object-cover" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactCtaPreFooterSection;

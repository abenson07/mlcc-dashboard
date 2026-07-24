"use client";

import * as React from "react";
import { getApiBase } from "@/lib/apiBase";

export function CommitteeSpotlightSection({
  committeeName,
  headline,
  body,
  image,
}: {
  committeeName?: string;
  headline: string;
  body: string;
  image?: string;
}) {
  const headlineRef = React.useRef<HTMLDivElement>(null);
  const [headlineVisible, setHeadlineVisible] = React.useState(false);

  const gridRef = React.useRef<HTMLDivElement>(null);
  const [gridVisible, setGridVisible] = React.useState(false);

  const [meetingStatus, setMeetingStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleMeetingSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setMeetingStatus("submitting");
    try {
      const response = await fetch(`${getApiBase()}/api/public/committees/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          contact: formData.get("contact"),
          committeeName,
          source: "meeting-signup",
          website: formData.get("website"),
        }),
      });

      if (!response.ok) throw new Error("Request failed");
      setMeetingStatus("success");
      form.reset();
    } catch {
      setMeetingStatus("error");
    }
  }

  React.useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const observe = (ref: React.RefObject<HTMLElement | null>, setter: (v: boolean) => void) => {
      if (!ref.current) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setter(true);
            obs.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      obs.observe(ref.current);
      observers.push(obs);
    };

    observe(headlineRef, setHeadlineVisible);
    observe(gridRef, setGridVisible);

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const baseName = (committeeName ?? "").trim().replace(/\s*committee$/i, "").trim();
  const tagText = baseName ? `${baseName} Committee` : "Committee";

  return (
    <section
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="committees.spotlight"
      data-editable-label="Committee Spotlight"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-[7.5rem] max-[767px]:py-20">
            <div
              ref={headlineRef}
              className={`
                mx-auto flex max-w-[49.75rem] flex-col items-center justify-start gap-6 text-center
                transition-all duration-700 ease-out
                max-[767px]:w-full max-[767px]:max-w-none
                ${headlineVisible ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-[12px] translate-y-5"}
              `}
            >
              <div className="flex flex-col items-center justify-start gap-4">
                <div className="flex items-center justify-center rounded-2xl border border-sparkles-navy/16 bg-sparkles-cream px-3 py-1 text-sparkles-navy">
                  <span className="font-body text-xs leading-4 font-normal">{tagText}</span>
                </div>

                <h1 className="m-0 font-display text-[3.75rem] leading-16 font-bold tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                  {headline}
                </h1>
              </div>

              <div className="flex max-w-[28rem] flex-col items-center justify-start gap-6">
                <p className="m-0 font-body text-base leading-6 font-normal text-sparkles-navy">
                  {body}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="#open-positions"
                    className="flex items-center justify-center gap-2 rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm leading-5 font-bold uppercase text-sparkles-cream no-underline transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
                  >
                    <span>Get involved</span>
                    <span className="flex h-4 w-4 flex-none items-center justify-center overflow-visible">
                      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                        <path
                          d="M3 8h10M9 4l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </a>

                  <a
                    href="#join-committee"
                    className="flex items-center justify-center gap-2 rounded-[2rem] border border-sparkles-navy/30 bg-white/50 px-4 py-3 font-display text-sm leading-5 font-bold uppercase text-puget-night no-underline transition-all duration-300 hover:border-white/10 hover:bg-sparkles-navy/90 hover:text-sparkles-cream"
                  >
                    <span>Learn more</span>
                  </a>
                </div>
              </div>
            </div>

            <div
              ref={gridRef}
              className={`
                mt-12 grid w-full gap-4
                [grid-template-columns:8fr_4fr]
                max-[991px]:[grid-template-columns:1fr_1fr]
                max-[767px]:[grid-template-columns:1fr]
                transition-all duration-700 ease-out delay-100
                ${gridVisible ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-[12px] translate-y-5"}
              `}
            >
              <div className="h-[32.5rem] w-full overflow-hidden rounded-3xl bg-[var(--sparkles-navy-16)] max-[767px]:h-[25rem] max-[767px]:rounded-[1.25rem]">
                {image ? (
                  <img loading="lazy" src={image} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>

              <div className="flex h-[32.5rem] w-full flex-col justify-between rounded-3xl bg-sparkles-navy p-8 max-[767px]:h-auto max-[767px]:rounded-[1.25rem] max-[767px]:p-6">
                <div className="mb-6 flex flex-col gap-2">
                  <h3 className="m-0 font-display text-2xl leading-7 font-bold tracking-[-0.03125rem] text-sparkles-cream">
                    Join us for our next committee meeting
                  </h3>
                </div>

                <div className="flex flex-col">
                  <form
                    className="flex flex-col gap-3"
                    aria-label="Committee meeting signup"
                    onSubmit={handleMeetingSignup}
                  >
                    <input
                      className="min-h-12 w-full rounded-lg border border-sparkles-cream/20 bg-sparkles-cream/10 px-4 py-2 font-body text-base leading-6 text-sparkles-cream placeholder:text-sparkles-cream/50 focus:border-sparkles-cream focus:outline-none"
                      type="text"
                      name="name"
                      placeholder="Name"
                      autoComplete="name"
                      maxLength={256}
                      required
                    />
                    <input
                      className="min-h-12 w-full rounded-lg border border-sparkles-cream/20 bg-sparkles-cream/10 px-4 py-2 font-body text-base leading-6 text-sparkles-cream placeholder:text-sparkles-cream/50 focus:border-sparkles-cream focus:outline-none"
                      type="text"
                      name="contact"
                      placeholder="Email or phone"
                      autoComplete="off"
                      maxLength={256}
                      required
                    />
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}
                    />

                    <button
                      type="submit"
                      disabled={meetingStatus === "submitting"}
                      className="mt-1 cursor-pointer rounded-[2rem] border border-sparkles-cream bg-sparkles-cream px-4 py-3 font-display text-sm leading-5 font-bold uppercase text-sparkles-navy transition-all duration-300 hover:border-sparkles-cream/90 hover:bg-sparkles-cream/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {meetingStatus === "submitting" ? "Sending…" : "Request to join"}
                    </button>
                    {meetingStatus === "success" ? (
                      <span className="font-body text-xs text-sparkles-cream">Thanks! We&apos;ll be in touch!</span>
                    ) : null}
                    {meetingStatus === "error" ? (
                      <span className="font-body text-xs text-red-300">
                        Something went wrong. Please try again.
                      </span>
                    ) : null}
                  </form>

                  <p className="m-0 mt-4 font-body text-xs leading-4 font-normal text-sparkles-cream/60">
                    Meetings are often hosted in neighbors&apos; homes, so we don&apos;t post the address publicly. A
                    committee member will reach out to share the details and get you signed up.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CommitteeSpotlightSection;

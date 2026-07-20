"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import * as React from "react";

const HERO_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695312357b037d99bca1b7e9_leaflet.webp";

const inputClassName =
  "min-h-12 w-full rounded-2xl border border-sparkles-warm bg-sparkles-warm px-4 py-2 font-body text-base leading-6 text-sparkles-navy placeholder:text-sparkles-muted focus:border-sparkles-navy focus:outline-none";

export function SubscribeHeroSection() {
  const [submitHovered, setSubmitHovered] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError(true);
      return;
    }
    setSubmitted(true);
    setError(false);
  };

  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="subscribe.hero"
      data-editable-label="Subscribe Hero"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-20 max-[767px]:py-16">
            <div className="grid items-center gap-16 [grid-template-columns:1.1fr_0.9fr] max-[991px]:grid-cols-1 max-[991px]:gap-12">
              <div className="flex flex-col items-start justify-center gap-6 max-[991px]:items-center max-[991px]:text-center">
                <div className="flex max-w-[34.375rem] flex-col items-start gap-6 max-[991px]:items-center">
                  <SectionLabel>Newsletter</SectionLabel>
                  <h1 className="m-0 font-display text-[3.75rem] font-bold leading-16 tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                    Stay connected to Maple Leaf
                  </h1>
                </div>

                <p className="m-0 max-w-[26.875rem] font-body text-xl leading-7 font-normal text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                  Get event reminders, neighborhood updates, and highlights from the Leaflet, delivered
                  to your inbox. Sign up takes less than a minute.
                </p>

                <div className="w-full max-w-[28.5rem]">
                  {submitted ? (
                    <div className="rounded-2xl border border-sparkles-navy/20 bg-sparkles-warm px-6 py-5 text-left">
                      <p className="m-0 font-display text-lg font-bold text-puget-night">
                        You&apos;re on the list!
                      </p>
                      <p className="mt-2 mb-0 font-body text-base leading-6 text-sparkles-navy">
                        Thanks for subscribing. Watch your inbox for the next Maple Leaf Community
                        Council update.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
                      <input
                        className={inputClassName}
                        name="first-name"
                        placeholder="First name"
                        type="text"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                      <input
                        className={inputClassName}
                        name="email"
                        placeholder="Email address"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <input
                        type="submit"
                        value="Subscribe"
                        onMouseEnter={() => setSubmitHovered(true)}
                        onMouseLeave={() => setSubmitHovered(false)}
                        className={`
                          cursor-pointer rounded-[2rem] border px-4 py-3 font-display text-sm leading-5 font-bold
                          text-sparkles-cream transition-all duration-300
                          ${submitHovered ? "border-sparkles-navy/90 bg-sparkles-navy/90" : "border-sparkles-navy bg-sparkles-navy"}
                        `}
                      />
                      <p className="m-0 font-body text-xs leading-4 text-sparkles-muted">
                        We send a few emails per month. Unsubscribe anytime.
                      </p>
                    </form>
                  )}
                  {error && (
                    <p className="mt-3 mb-0 font-body text-sm leading-5 text-sparkles-accent">
                      Please enter a valid email address.
                    </p>
                  )}
                </div>
              </div>

              <div className="relative max-[991px]:mx-auto max-[991px]:w-[90%] max-[991px]:max-w-[28.125rem]">
                <img
                  loading="eager"
                  alt="A neighbor holding a copy of the Maple Leaf Leaflet newsletter"
                  src={HERO_IMAGE}
                  className="w-full rounded-2xl object-cover"
                />
                <div className="absolute -bottom-6 -left-6 max-w-[15rem] rounded-2xl border border-sparkles-warm bg-sparkles-cream p-5 shadow-sm max-[767px]:-left-2 max-[767px]:max-w-[13rem] max-[767px]:p-4">
                  <p className="m-0 font-display text-2xl font-bold leading-8 tracking-[-0.0625rem] text-puget-night max-[767px]:text-xl max-[767px]:leading-7">
                    50+
                  </p>
                  <p className="mt-1 mb-0 font-body text-sm leading-5 text-sparkles-navy">
                    neighbors help deliver the printed Leaflet to every doorstep each issue
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

export default SubscribeHeroSection;

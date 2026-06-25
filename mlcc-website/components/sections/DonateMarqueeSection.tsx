"use client";

import Link from "next/link";
import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { donationAmounts } from "@marketing/data/donate";
import { membershipPrograms } from "@marketing/data/membership";

const SLIDE_INTERVAL_MS = 4000;

const inputClassName =
  "min-h-12 w-full rounded-2xl border border-sparkles-warm bg-sparkles-warm px-4 py-2 font-body text-base leading-6 text-sparkles-navy placeholder:text-sparkles-muted focus:border-sparkles-navy focus:outline-none";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function ProgramShowcase({ currentSlide }: { currentSlide: number }) {
  const program = membershipPrograms[currentSlide];

  return (
    <div className="relative h-full max-[991px]:mx-auto max-[991px]:w-full max-[991px]:max-w-[34rem]">
      <div className="relative h-[34rem] w-full overflow-hidden rounded-2xl max-[767px]:h-[24rem] max-[479px]:h-[20rem]">
        {membershipPrograms.map((item, index) => (
          <img
            key={item.title}
            src={item.image}
            alt={item.title}
            loading={index === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "z-[2] opacity-100" : "z-[1] opacity-0"
            }`}
          />
        ))}
      </div>

      <div className="absolute -bottom-6 -left-6 z-[3] flex w-[18rem] max-w-[78%] flex-col gap-2 rounded-2xl border border-sparkles-warm bg-sparkles-cream p-6 shadow-sm max-[767px]:-left-2 max-[767px]:w-[15rem] max-[767px]:p-5">
        <span className="font-body text-xs font-bold uppercase leading-4 tracking-[0.0625rem] text-sparkles-muted">
          Your gift supports
        </span>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-3xl font-bold leading-9 tracking-[-0.0625rem] text-puget-night max-[767px]:text-2xl max-[767px]:leading-8">
            {program.title}
          </span>
          <svg
            className="h-10 w-10 shrink-0 text-puget-night"
            width="40"
            height="40"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M14 34L34 14M34 14H18M34 14V30" stroke="currentColor" strokeLinecap="square" />
          </svg>
        </div>
        <span className="font-body text-xs leading-4 text-sparkles-navy">
          {currentSlide + 1} of {membershipPrograms.length} neighborhood programs your gift powers
        </span>
      </div>
    </div>
  );
}

export function DonateMarqueeSection() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [selectedAmount, setSelectedAmount] = React.useState(donationAmounts[1].value);
  const [customAmount, setCustomAmount] = React.useState("");
  const [useCustom, setUseCustom] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [submitHovered, setSubmitHovered] = React.useState(false);
  const totalSlides = membershipPrograms.length;

  const activeAmount = useCustom ? Number.parseFloat(customAmount) || 0 : selectedAmount;
  const canSubmit = activeAmount > 0 && email.trim().includes("@");

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [totalSlides]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitted(true);
  };

  return (
    <section id="give" className="relative overflow-hidden bg-sparkles-cream text-sparkles-navy">
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="grid items-start gap-12 py-20 [grid-template-columns:minmax(0,1.3fr)_minmax(0,1fr)] max-[991px]:grid-cols-1 max-[991px]:gap-16 max-[767px]:py-16">
            {/* Left: headline + donation form */}
            <div className="flex max-w-[35.25rem] flex-col items-start gap-6 max-[991px]:max-w-none">
              <SectionLabel>Give today</SectionLabel>

              <h1 className="m-0 font-display text-[3.75rem] font-bold leading-16 tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                A one-time gift keeps Maple Leaf going
              </h1>

              <p className="m-0 font-body text-xl leading-7 text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                Not ready for a monthly membership? A single donation still fuels the programs,
                events, and traditions that connect this neighborhood.
              </p>

              {submitted ? (
                <div className="w-full max-w-[30rem] rounded-2xl border border-sparkles-navy/20 bg-sparkles-warm px-6 py-5">
                  <p className="m-0 font-display text-lg font-bold text-puget-night">
                    Thank you for your generosity!
                  </p>
                  <p className="mt-2 mb-0 font-body text-base leading-6 text-sparkles-navy">
                    Your {formatCurrency(activeAmount)} gift to the Maple Leaf Community Council means a
                    lot. Payment processing will be connected soon — we&apos;ll follow up at {email}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex w-full max-w-[30rem] flex-col gap-5">
                  <div className="grid grid-cols-2 gap-2 max-[479px]:grid-cols-1">
                    {donationAmounts.map((option) => {
                      const isSelected = !useCustom && selectedAmount === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setUseCustom(false);
                            setSelectedAmount(option.value);
                          }}
                          className={`flex cursor-pointer flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all duration-200 ${
                            isSelected
                              ? "border-sparkles-navy bg-sparkles-navy text-sparkles-cream"
                              : "border-sparkles-navy/16 bg-sparkles-warm text-sparkles-navy hover:border-sparkles-navy/40"
                          }`}
                        >
                          <span className="font-display text-2xl font-bold leading-8 tracking-[-0.0625rem]">
                            {option.label}
                          </span>
                          <span
                            className={`font-body text-xs leading-4 ${
                              isSelected ? "text-sparkles-cream/75" : "text-sparkles-muted"
                            }`}
                          >
                            {option.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label
                      htmlFor="custom-amount"
                      className="mb-2 block font-body text-sm font-semibold leading-5 text-sparkles-navy"
                    >
                      Or enter a custom amount
                    </label>
                    <input
                      id="custom-amount"
                      className={inputClassName}
                      name="custom-amount"
                      placeholder="$ Amount"
                      type="number"
                      min="1"
                      step="1"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setUseCustom(e.target.value.length > 0);
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <input
                      className={inputClassName}
                      name="first-name"
                      placeholder="First name (optional)"
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
                  </div>

                  <input
                    type="submit"
                    value={`Give ${formatCurrency(activeAmount)}`}
                    disabled={!canSubmit}
                    onMouseEnter={() => setSubmitHovered(true)}
                    onMouseLeave={() => setSubmitHovered(false)}
                    className={`
                      cursor-pointer rounded-[2rem] border px-4 py-3 font-display text-sm font-bold leading-5
                      text-sparkles-cream transition-all duration-300
                      disabled:cursor-not-allowed disabled:opacity-50
                      ${submitHovered && canSubmit ? "border-sparkles-navy/90 bg-sparkles-navy/90" : "border-sparkles-navy bg-sparkles-navy"}
                    `}
                  />

                  <p className="m-0 font-body text-xs leading-4 text-sparkles-muted">
                    Prefer steady support?{" "}
                    <Link
                      href="/membership"
                      className="font-semibold text-sparkles-navy underline-offset-2 hover:underline"
                    >
                      Join as a member
                    </Link>{" "}
                    from $3/month.
                  </p>
                </form>
              )}
            </div>

            {/* Right: cycling image + floating widget */}
            <ProgramShowcase currentSlide={currentSlide} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default DonateMarqueeSection;

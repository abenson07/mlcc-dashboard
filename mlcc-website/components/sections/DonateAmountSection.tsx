"use client";

import Link from "next/link";
import * as React from "react";
import { SectionLabel } from "@marketing/components/SectionLabel";
import { donationAmounts } from "@marketing/data/donate";

const HERO_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695b2ef4da00327d5e0c5403_love-your-neighbor.webp";

const inputClassName =
  "min-h-12 w-full rounded-2xl border border-sparkles-warm bg-sparkles-warm px-4 py-2 font-body text-base leading-6 text-sparkles-navy placeholder:text-sparkles-muted focus:border-sparkles-navy focus:outline-none";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DonateAmountSection() {
  const [selectedAmount, setSelectedAmount] = React.useState(donationAmounts[1].value);
  const [customAmount, setCustomAmount] = React.useState("");
  const [useCustom, setUseCustom] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [submitHovered, setSubmitHovered] = React.useState(false);

  const activeAmount = useCustom ? Number.parseFloat(customAmount) || 0 : selectedAmount;
  const canSubmit = activeAmount > 0 && email.trim().includes("@");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitted(true);
  };

  return (
    <section
      id="give"
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="template.donate-amount"
      data-editable-label="Donate Amount (Template)"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-20 max-[767px]:py-16">
            <div className="grid items-start gap-16 [grid-template-columns:1.1fr_0.9fr] max-[991px]:grid-cols-1 max-[991px]:gap-12">
              <div className="flex flex-col items-start gap-8">
                <div className="flex max-w-[34.375rem] flex-col items-start gap-6">
                  <SectionLabel>One-time gift</SectionLabel>
                  <h2 className="m-0 font-display text-[3rem] font-bold leading-[3.25rem] tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                    Give what you can, right now
                  </h2>
                </div>

                <p className="m-0 max-w-[30rem] font-body text-xl leading-7 max-[767px]:text-base max-[767px]:leading-6">
                  Pick an amount or enter your own. Unlike membership, this is a single gift — no
                  recurring charge.
                </p>

                {submitted ? (
                  <div className="w-full max-w-[28.5rem] rounded-2xl border border-sparkles-navy/20 bg-sparkles-warm px-6 py-5">
                    <p className="m-0 font-display text-lg font-bold text-puget-night">
                      Thank you for your generosity!
                    </p>
                    <p className="mt-2 mb-0 font-body text-base leading-6 text-sparkles-navy">
                      Your {formatCurrency(activeAmount)} gift to the Maple Leaf Community Council
                      means a lot. Payment processing will be connected soon — we&apos;ll follow up
                      at {email}.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex w-full max-w-[28.5rem] flex-col gap-5">
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
                      <Link href="/membership" className="font-semibold text-sparkles-navy underline-offset-2 hover:underline">
                        Join as a member
                      </Link>{" "}
                      from $3/month.
                    </p>
                  </form>
                )}
              </div>

              <div className="relative max-[991px]:mx-auto max-[991px]:w-[90%] max-[991px]:max-w-[28.125rem]">
                <img
                  loading="lazy"
                  alt="Neighbors gathering at a Love Your Neighbor event in Maple Leaf"
                  src={HERO_IMAGE}
                  className="w-full rounded-2xl object-cover"
                />
                <div className="absolute -bottom-6 -left-6 max-w-[15rem] rounded-2xl border border-sparkles-warm bg-sparkles-cream p-5 shadow-sm max-[767px]:-left-2 max-[767px]:max-w-[13rem] max-[767px]:p-4">
                  <p className="m-0 font-display text-2xl font-bold leading-8 tracking-[-0.0625rem] text-puget-night max-[767px]:text-xl max-[767px]:leading-7">
                    4,500+
                  </p>
                  <p className="mt-1 mb-0 font-body text-sm leading-5 text-sparkles-navy">
                    neighbors attend MLCC events each year — your gift helps keep them going
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

export default DonateAmountSection;

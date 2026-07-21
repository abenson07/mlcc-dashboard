"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SectionLabel } from "@marketing/components/SectionLabel";
import {
  findMembershipTier,
  formatMembershipPrice,
  membershipTiers,
  type MembershipTierSlug,
} from "@marketing/data/membership-tiers";

type BillingMode = "recurring" | "onetime";

function inputClassName() {
  return "w-full min-h-12 rounded-2xl border border-sparkles-navy/30 bg-white/60 px-4 py-2 font-body text-sm leading-5 text-puget-night placeholder:text-sparkles-muted focus:border-sparkles-navy focus:outline-none";
}

export function MembershipJoinSection() {
  const searchParams = useSearchParams();
  const requestedTier = searchParams.get("tier");

  const [tier, setTier] = React.useState<MembershipTierSlug>(
    findMembershipTier(requestedTier)?.slug ?? "household"
  );
  const [billingMode, setBillingMode] = React.useState<BillingMode>("recurring");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [newsletterOptIn, setNewsletterOptIn] = React.useState(false);
  const [volunteerOptIn, setVolunteerOptIn] = React.useState(false);
  const [digestOptIn, setDigestOptIn] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selectedTier = findMembershipTier(tier) ?? membershipTiers[0]!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/checkout/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          billingMode,
          name,
          email,
          optIns: {
            newsletter: newsletterOptIn,
            digest: digestOptIn,
            volunteer: volunteerOptIn,
          },
        }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Checkout failed");
      }
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setSubmitting(false);
    }
  }

  return (
    <section
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="membership.join"
      data-editable-label="Membership Join"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px] py-40 max-[767px]:py-20">
          <div className="mb-12 flex flex-col items-start gap-2">
            <SectionLabel>Membership</SectionLabel>
            <h1 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7">
              Join Maple Leaf
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-[1.5fr_1fr] gap-16 max-[991px]:grid-cols-1 max-[991px]:gap-10"
          >
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <div className="font-display text-lg leading-6 font-bold text-puget-night">
                  Choose a membership
                </div>
                <div className="grid grid-cols-2 gap-3 max-[479px]:grid-cols-1">
                  {membershipTiers.map((t) => {
                    const isSelected = t.slug === tier;
                    return (
                      <button
                        key={t.slug}
                        type="button"
                        onClick={() => setTier(t.slug)}
                        aria-pressed={isSelected}
                        className={`flex flex-col items-start gap-1 rounded-2xl border-[3px] p-5 text-left transition-colors ${
                          isSelected
                            ? "border-sparkles-navy bg-sparkles-warm"
                            : "border-sparkles-navy/20 bg-white/40 hover:border-sparkles-navy/50"
                        }`}
                      >
                        <div className="flex w-full items-baseline justify-between gap-2">
                          <span className="font-display text-lg font-bold text-puget-night">
                            {t.name}
                          </span>
                          <span className="font-display text-lg font-bold text-puget-night">
                            {formatMembershipPrice(t.priceCents)}
                          </span>
                        </div>
                        <p className="m-0 font-body text-sm leading-5 text-sparkles-muted">
                          {t.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="font-display text-lg leading-6 font-bold text-puget-night">
                  Billing
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBillingMode("recurring")}
                    aria-pressed={billingMode === "recurring"}
                    className={`flex-1 rounded-2xl border-[3px] px-5 py-4 text-left transition-colors ${
                      billingMode === "recurring"
                        ? "border-sparkles-navy bg-sparkles-warm"
                        : "border-sparkles-navy/20 bg-white/40 hover:border-sparkles-navy/50"
                    }`}
                  >
                    <div className="font-display text-base font-bold text-puget-night">
                      Recurring
                    </div>
                    <p className="m-0 font-body text-sm leading-5 text-sparkles-muted">
                      Renews automatically every year.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingMode("onetime")}
                    aria-pressed={billingMode === "onetime"}
                    className={`flex-1 rounded-2xl border-[3px] px-5 py-4 text-left transition-colors ${
                      billingMode === "onetime"
                        ? "border-sparkles-navy bg-sparkles-warm"
                        : "border-sparkles-navy/20 bg-white/40 hover:border-sparkles-navy/50"
                    }`}
                  >
                    <div className="font-display text-base font-bold text-puget-night">
                      One-time
                    </div>
                    <p className="m-0 font-body text-sm leading-5 text-sparkles-muted">
                      A single payment; you renew manually next year.
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="font-display text-lg leading-6 font-bold text-puget-night">
                  Stay involved
                </div>

                <label className="flex items-start gap-3 font-body text-sm leading-5 text-puget-night">
                  <input
                    type="checkbox"
                    checked={newsletterOptIn}
                    onChange={(e) => setNewsletterOptIn(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-sparkles-navy"
                  />
                  <span>
                    Keep me updated — send me the monthly Maple Leaf neighborhood update email.
                  </span>
                </label>

                <div className="flex flex-col gap-2">
                  <label className="flex items-start gap-3 font-body text-sm leading-5 text-puget-night">
                    <input
                      type="checkbox"
                      checked={volunteerOptIn}
                      onChange={(e) => setVolunteerOptIn(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-sparkles-navy"
                    />
                    <span>Contact me about volunteering.</span>
                  </label>
                  <div className="ml-7 flex items-start gap-3 rounded-xl border border-sparkles-navy/20 bg-sparkles-warm px-4 py-3">
                    <span className="rounded-full bg-sparkles-navy px-2 py-0.5 font-display text-[0.625rem] font-bold uppercase tracking-wide text-sparkles-cream">
                      New
                    </span>
                    <p className="m-0 font-body text-xs leading-4 text-sparkles-navy">
                      Volunteer Days are back — a few hours a month goes a long way.{" "}
                      <Link href="/volunteer" className="font-bold underline underline-offset-2">
                        See what's open
                      </Link>
                      .
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 font-body text-sm leading-5 text-puget-night">
                  <input
                    type="checkbox"
                    checked={digestOptIn}
                    onChange={(e) => setDigestOptIn(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-sparkles-navy"
                  />
                  <span>
                    Sign me up for the weekly digest — trying to get off social media? Get a
                    weekly heads-up on what's happening in the neighborhood, straight to your
                    inbox.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex h-fit flex-col gap-4 rounded-[1.75rem] border-[3px] border-sparkles-navy bg-sparkles-cream p-7">
              <div className="font-display text-xl leading-6 font-bold text-puget-night">
                Your details
              </div>

              <input
                required
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClassName()}
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName()}
              />

              {error && <p className="m-0 font-body text-sm leading-5 text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-6 py-3 font-display text-sm leading-5 font-bold text-sparkles-cream uppercase transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90 disabled:opacity-60"
              >
                {submitting
                  ? "Redirecting…"
                  : `Join: ${formatMembershipPrice(selectedTier.priceCents)}${
                      billingMode === "recurring" ? "/year" : ""
                    }`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default MembershipJoinSection;

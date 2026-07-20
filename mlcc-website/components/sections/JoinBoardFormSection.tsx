"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import { TestimonialPanel } from "@marketing/components/byq/TestimonialPanel";
import { useRouter } from "next/navigation";
import * as React from "react";

const HERO_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695313c6b976b35d22bb2d6d_community-meeting.webp";

const fieldLabelClassName =
  "font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-muted";

const inputClassName =
  "w-full min-h-12 appearance-none rounded-lg border border-sparkles-warm bg-white px-4 py-3 font-body text-base leading-6 text-sparkles-navy placeholder:text-sparkles-muted focus:border-sparkles-navy focus:outline-none";

export function JoinBoardFormSection() {
  const router = useRouter();
  const [submitHovered, setSubmitHovered] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [interest, setInterest] = React.useState("");
  const [experience, setExperience] = React.useState("");
  const [priorInvolvement, setPriorInvolvement] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!interest.trim()) {
      setError("Please tell us what draws you to board service.");
      return;
    }

    setIsSubmitting(true);

    // Placeholder until a backend endpoint is wired up.
    await new Promise((resolve) => setTimeout(resolve, 400));

    router.push("/join-the-board/confirmation");
  };

  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="join-the-board.form"
      data-editable-label="Join The Board Form"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-20 max-[767px]:py-16">
            <div className="grid items-start gap-16 [grid-template-columns:1fr_1.05fr] max-[991px]:grid-cols-1 max-[991px]:gap-12">
              <div className="flex flex-col gap-12 max-[991px]:gap-8">
                <div className="flex max-w-[35rem] flex-col items-start gap-6 max-[991px]:max-w-none">
                  <SectionLabel>Executive board</SectionLabel>
                  <h1 className="m-0 font-display text-[3.75rem] font-bold leading-16 tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                    Join the board
                  </h1>
                  <p className="m-0 font-body text-xl leading-7 font-normal text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                    The executive board keeps Maple Leaf&apos;s community council running: setting
                    direction, supporting committees, and making sure neighbors have a voice. If
                    you&apos;re curious about serving, tell us a little about yourself. No commitment
                    required to start the conversation.
                  </p>
                </div>

                <div className="max-w-[22rem] max-[991px]:max-w-none">
                  <TestimonialPanel
                    quote="Many current board members started by volunteering on a committee or showing up to a community meeting. Expressing interest is simply the first step."
                    name="Maple Leaf Community Council"
                    attribution="Built by neighbors, sustained by neighbors"
                    avatarSrc={HERO_IMAGE}
                  />
                </div>
              </div>

              <div className="w-full">
                <div className="rounded-2xl bg-sparkles-warm p-8 text-sparkles-navy max-[767px]:p-6">
                  <div className="mb-8 flex flex-col gap-2">
                    <h2 className="m-0 font-display text-2xl font-bold leading-7 tracking-[-0.03125rem] text-puget-night">
                      Express your interest
                    </h2>
                    <p className="m-0 font-body text-sm leading-5 text-sparkles-muted">
                      We&apos;ll follow up by email to talk about timing, open roles, and whether
                      board service is the right fit. This takes about two minutes.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="board-name" className={fieldLabelClassName}>
                        Your name
                      </label>
                      <input
                        id="board-name"
                        className={inputClassName}
                        name="name"
                        placeholder="Alex Johnson"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-[479px]:grid-cols-1">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="board-email" className={fieldLabelClassName}>
                          Email
                        </label>
                        <input
                          id="board-email"
                          className={inputClassName}
                          name="email"
                          placeholder="you@example.com"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="board-phone" className={fieldLabelClassName}>
                          Phone (optional)
                        </label>
                        <input
                          id="board-phone"
                          className={inputClassName}
                          name="phone"
                          placeholder="(206) 555-0100"
                          type="tel"
                          autoComplete="tel"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="board-interest" className={fieldLabelClassName}>
                        What interests you about serving on the board?
                      </label>
                      <textarea
                        id="board-interest"
                        className={`${inputClassName} min-h-[10rem] resize-y`}
                        name="interest"
                        placeholder="What would you hope to contribute? Is there a particular area (events, advocacy, communications) that draws you in?"
                        required
                        value={interest}
                        onChange={(event) => setInterest(event.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="board-experience" className={fieldLabelClassName}>
                        Relevant experience (optional)
                      </label>
                      <textarea
                        id="board-experience"
                        className={`${inputClassName} min-h-[7rem] resize-y`}
                        name="experience"
                        placeholder="Professional background, volunteer history, or skills you'd bring, whatever feels useful."
                        value={experience}
                        onChange={(event) => setExperience(event.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="board-prior-involvement" className={fieldLabelClassName}>
                        Prior involvement with MLCC (optional)
                      </label>
                      <input
                        id="board-prior-involvement"
                        className={inputClassName}
                        name="priorInvolvement"
                        placeholder="Committee volunteer, event attendee, Leaflet reader, anything that helps us know your connection to Maple Leaf"
                        type="text"
                        value={priorInvolvement}
                        onChange={(event) => setPriorInvolvement(event.target.value)}
                      />
                    </div>

                    {error ? (
                      <p className="m-0 font-body text-sm leading-5 text-sparkles-accent">{error}</p>
                    ) : null}

                    <div>
                      <input
                        type="submit"
                        value={isSubmitting ? "Sending..." : "Submit interest"}
                        disabled={isSubmitting}
                        onMouseEnter={() => setSubmitHovered(true)}
                        onMouseLeave={() => setSubmitHovered(false)}
                        className={`
                          mt-1 w-full cursor-pointer rounded-[2rem] border px-4 py-3 font-display text-sm leading-5 font-bold uppercase
                          text-sparkles-cream transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70
                          ${submitHovered ? "border-sparkles-navy/90 bg-sparkles-navy/90" : "border-sparkles-navy bg-sparkles-navy"}
                        `}
                      />
                      <p className="mt-3 mb-0 font-body text-xs leading-4 text-sparkles-muted">
                        Submitting this form starts a conversation, not an application. A board
                        member will reach out to learn more and answer your questions.
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default JoinBoardFormSection;

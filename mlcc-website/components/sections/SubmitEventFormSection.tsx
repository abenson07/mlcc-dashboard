"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import { TestimonialPanel } from "@marketing/components/byq/TestimonialPanel";
import { useRouter } from "next/navigation";
import * as React from "react";

const HERO_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/69530e8b1aadf47968a6eb09_summer_social_2024-62%20(1).webp";

const fieldLabelClassName =
  "font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-muted";

const inputClassName =
  "w-full min-h-12 appearance-none rounded-lg border border-sparkles-warm bg-white px-4 py-3 font-body text-base leading-6 text-sparkles-navy placeholder:text-sparkles-muted focus:border-sparkles-navy focus:outline-none";

const sectionHeadingClassName =
  "m-0 font-display text-lg font-bold leading-6 tracking-[-0.02rem] text-puget-night";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SubmitEventFormSection() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [submitHovered, setSubmitHovered] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [eventName, setEventName] = React.useState("");
  const [eventDate, setEventDate] = React.useState("");
  const [eventTime, setEventTime] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [eventUrl, setEventUrl] = React.useState("");
  const [images, setImages] = React.useState<File[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setImages((current) => [...current, ...selected]);
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((current) => current.filter((_, i) => i !== index));
  };

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

    if (!eventName.trim()) {
      setError("Please enter the event name.");
      return;
    }

    if (!eventDate.trim()) {
      setError("Please enter the event date.");
      return;
    }

    if (!location.trim()) {
      setError("Please enter where the event takes place.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe the event so neighbors know what to expect.");
      return;
    }

    setIsSubmitting(true);

    // Placeholder until a backend endpoint is wired up.
    await new Promise((resolve) => setTimeout(resolve, 400));

    router.push("/submit-event/confirmation");
  };

  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="submit-event.form"
      data-editable-label="Submit Event Form"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-20 max-[767px]:py-16">
            <div className="grid items-start gap-16 [grid-template-columns:1fr_1.05fr] max-[991px]:grid-cols-1 max-[991px]:gap-12">
              <div className="flex flex-col gap-12 max-[991px]:gap-8">
                <div className="flex max-w-[35rem] flex-col items-start gap-6 max-[991px]:max-w-none">
                  <SectionLabel>Community events</SectionLabel>
                  <h1 className="m-0 font-display text-[3.75rem] font-bold leading-16 tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                    Submit an event
                  </h1>
                  <p className="m-0 font-body text-xl leading-7 font-normal text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                    Know about something happening in Maple Leaf? Share it with neighbors. Whether
                    you&apos;re organizing it or just spreading the word, we&apos;ll review your
                    submission and add it to our events calendar if it fits our community guidelines.
                  </p>
                </div>

                <div className="max-w-[22rem] max-[991px]:max-w-none">
                  <TestimonialPanel
                    quote="From block parties to book clubs, the events calendar helps neighbors find each other. Your submission keeps that list fresh and useful."
                    name="Events Committee"
                    attribution="Maple Leaf Community Council"
                    avatarSrc={HERO_IMAGE}
                  />
                </div>
              </div>

              <div className="w-full">
                <div className="rounded-2xl bg-sparkles-warm p-8 text-sparkles-navy max-[767px]:p-6">
                  <div className="mb-8 flex flex-col gap-2">
                    <h2 className="m-0 font-display text-2xl font-bold leading-7 tracking-[-0.03125rem] text-puget-night">
                      Event submission form
                    </h2>
                    <p className="m-0 font-body text-sm leading-5 text-sparkles-muted">
                      Tell us how to reach you, then share the event details. This takes about three
                      minutes.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    <div className="flex flex-col gap-5">
                      <h3 className={sectionHeadingClassName}>Your contact info</h3>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="event-submitter-name" className={fieldLabelClassName}>
                          Your name
                        </label>
                        <input
                          id="event-submitter-name"
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
                          <label htmlFor="event-submitter-email" className={fieldLabelClassName}>
                            Email
                          </label>
                          <input
                            id="event-submitter-email"
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
                          <label htmlFor="event-submitter-phone" className={fieldLabelClassName}>
                            Phone (optional)
                          </label>
                          <input
                            id="event-submitter-phone"
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
                    </div>

                    <div className="flex flex-col gap-5">
                      <h3 className={sectionHeadingClassName}>About the event</h3>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="event-name" className={fieldLabelClassName}>
                          Event name
                        </label>
                        <input
                          id="event-name"
                          className={inputClassName}
                          name="eventName"
                          placeholder="Maple Leaf Summer Social"
                          type="text"
                          required
                          value={eventName}
                          onChange={(event) => setEventName(event.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 max-[479px]:grid-cols-1">
                        <div className="flex flex-col gap-2">
                          <label htmlFor="event-date" className={fieldLabelClassName}>
                            Date
                          </label>
                          <input
                            id="event-date"
                            className={inputClassName}
                            name="eventDate"
                            type="date"
                            required
                            value={eventDate}
                            onChange={(event) => setEventDate(event.target.value)}
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label htmlFor="event-time" className={fieldLabelClassName}>
                            Start time (optional)
                          </label>
                          <input
                            id="event-time"
                            className={inputClassName}
                            name="eventTime"
                            type="time"
                            value={eventTime}
                            onChange={(event) => setEventTime(event.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="event-location" className={fieldLabelClassName}>
                          Location
                        </label>
                        <input
                          id="event-location"
                          className={inputClassName}
                          name="location"
                          placeholder="Maple Leaf Park, 1020 NE 98th St"
                          type="text"
                          required
                          value={location}
                          onChange={(event) => setLocation(event.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="event-description" className={fieldLabelClassName}>
                          Event description
                        </label>
                        <textarea
                          id="event-description"
                          className={`${inputClassName} min-h-[10rem] resize-y`}
                          name="description"
                          placeholder="What is this event about? Who should attend? Is there a cost or registration?"
                          required
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="event-url" className={fieldLabelClassName}>
                          Event link (optional)
                        </label>
                        <input
                          id="event-url"
                          className={inputClassName}
                          name="eventUrl"
                          placeholder="https://example.com/event"
                          type="url"
                          value={eventUrl}
                          onChange={(event) => setEventUrl(event.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                          <span className={fieldLabelClassName}>Event image (optional)</span>
                          <p className="m-0 font-body text-sm leading-5 text-sparkles-muted">
                            JPG, PNG, or WebP. A photo helps neighbors recognize the event.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex min-h-[7rem] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-sparkles-navy/20 bg-white px-4 py-6 text-center transition-colors duration-200 hover:border-sparkles-navy/35 hover:bg-sparkles-cream"
                        >
                          <span className="font-display text-sm font-bold uppercase text-sparkles-navy">
                            Add image
                          </span>
                          <span className="font-body text-sm leading-5 text-sparkles-muted">
                            Click to browse from your device
                          </span>
                        </button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="sr-only"
                          onChange={handleImagesChange}
                        />

                        {images.length > 0 ? (
                          <ul className="m-0 flex list-none flex-col gap-2 p-0">
                            {images.map((file, index) => (
                              <li
                                key={`${file.name}-${file.lastModified}`}
                                className="flex items-center justify-between gap-3 rounded-lg border border-sparkles-warm bg-white px-4 py-3"
                              >
                                <div className="min-w-0">
                                  <p className="m-0 truncate font-body text-sm leading-5 text-sparkles-navy">
                                    {file.name}
                                  </p>
                                  <p className="m-0 font-body text-xs leading-4 text-sparkles-muted">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="cursor-pointer rounded-full border border-sparkles-navy/20 bg-transparent px-3 py-1 font-body text-xs font-bold uppercase tracking-[0.05rem] text-sparkles-navy transition-colors duration-200 hover:border-sparkles-navy/40"
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>

                    {error ? (
                      <p className="m-0 font-body text-sm leading-5 text-sparkles-accent">{error}</p>
                    ) : null}

                    <div>
                      <input
                        type="submit"
                        value={isSubmitting ? "Sending..." : "Submit event"}
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
                        We review every submission before publishing. Events must be open to the
                        community and relevant to Maple Leaf. We&apos;ll email you if we have
                        questions or when your event is live.
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

export default SubmitEventFormSection;

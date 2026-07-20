"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import { TestimonialPanel } from "@marketing/components/byq/TestimonialPanel";
import { useRouter } from "next/navigation";
import * as React from "react";

const HERO_IMAGE =
  "https://cdn.prod.website-files.com/67f50cf24b62add5c586bc28/695312357b037d99bca1b7e9_leaflet.webp";

const fieldLabelClassName =
  "font-body text-xs leading-4 font-bold uppercase tracking-[0.0625rem] text-sparkles-muted";

const inputClassName =
  "w-full min-h-12 appearance-none rounded-lg border border-sparkles-warm bg-white px-4 py-3 font-body text-base leading-6 text-sparkles-navy placeholder:text-sparkles-muted focus:border-sparkles-navy focus:outline-none";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SubmitStoryFormSection() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [submitHovered, setSubmitHovered] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [story, setStory] = React.useState("");
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

    if (!story.trim()) {
      setError("Please write your story before submitting.");
      return;
    }

    setIsSubmitting(true);

    // Placeholder until a backend endpoint is wired up.
    await new Promise((resolve) => setTimeout(resolve, 400));

    router.push("/submit-story/confirmation");
  };

  return (
    <section
      className="bg-sparkles-cream text-sparkles-navy"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="submit-story.form"
      data-editable-label="Submit Story Form"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="py-20 max-[767px]:py-16">
            <div className="grid items-start gap-16 [grid-template-columns:1fr_1.05fr] max-[991px]:grid-cols-1 max-[991px]:gap-12">
              <div className="flex flex-col gap-12 max-[991px]:gap-8">
                <div className="flex max-w-[35rem] flex-col items-start gap-6 max-[991px]:max-w-none">
                  <SectionLabel>The Leaflet</SectionLabel>
                  <h1 className="m-0 font-display text-[3.75rem] font-bold leading-16 tracking-[-0.15625rem] text-puget-night max-[767px]:text-[2.5rem] max-[767px]:leading-10 max-[767px]:tracking-[-0.0625rem]">
                    Share your Maple Leaf story
                  </h1>
                  <p className="m-0 font-body text-xl leading-7 font-normal text-sparkles-navy max-[767px]:text-base max-[767px]:leading-6">
                    Neighbors like you keep the Leaflet alive. Tell us what&apos;s happening in your
                    corner of the neighborhood, a few paragraphs is plenty. Add photos if you have them.
                  </p>
                </div>

                <div className="max-w-[22rem] max-[991px]:max-w-none">
                  <TestimonialPanel
                    quote="Most of our board members first learned about the council through the Leaflet. Your story could be the next one neighbors read at their doorstep."
                    name="The Leaflet"
                    attribution="Maple Leaf Community Council"
                    avatarSrc={HERO_IMAGE}
                  />
                </div>
              </div>

              <div className="w-full">
                <div className="rounded-2xl bg-sparkles-warm p-8 text-sparkles-navy max-[767px]:p-6">
                  <div className="mb-8 flex flex-col gap-2">
                    <h2 className="m-0 font-display text-2xl font-bold leading-7 tracking-[-0.03125rem] text-puget-night">
                      Submit your story
                    </h2>
                    <p className="m-0 font-body text-sm leading-5 text-sparkles-muted">
                      Name, email, and your story are all we need. This takes about two minutes.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="story-name" className={fieldLabelClassName}>
                        Your name
                      </label>
                      <input
                        id="story-name"
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

                    <div className="flex flex-col gap-2">
                      <label htmlFor="story-email" className={fieldLabelClassName}>
                        Email
                      </label>
                      <input
                        id="story-email"
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
                      <label htmlFor="story-content" className={fieldLabelClassName}>
                        Your story
                      </label>
                      <textarea
                        id="story-content"
                        className={`${inputClassName} min-h-[14rem] resize-y`}
                        name="story"
                        placeholder="What happened? Who was involved? Why does it matter to Maple Leaf?"
                        required
                        value={story}
                        onChange={(event) => setStory(event.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2">
                        <span className={fieldLabelClassName}>Photos (optional)</span>
                        <p className="m-0 font-body text-sm leading-5 text-sparkles-muted">
                          JPG, PNG, or WebP. You can add more than one.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex min-h-[7rem] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-sparkles-navy/20 bg-white px-4 py-6 text-center transition-colors duration-200 hover:border-sparkles-navy/35 hover:bg-sparkles-cream"
                      >
                        <span className="font-display text-sm font-bold uppercase text-sparkles-navy">
                          Add images
                        </span>
                        <span className="font-body text-sm leading-5 text-sparkles-muted">
                          Click to browse from your device
                        </span>
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
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

                    {error ? (
                      <p className="m-0 font-body text-sm leading-5 text-sparkles-accent">{error}</p>
                    ) : null}

                    <div>
                      <input
                        type="submit"
                        value={isSubmitting ? "Sending..." : "Submit story"}
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
                        We review every submission before publishing. We&apos;ll email you when your story
                        is approved or if we have questions.
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

export default SubmitStoryFormSection;

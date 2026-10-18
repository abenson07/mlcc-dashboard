import { defineField, defineType } from "sanity";

/** Featured recording / live stream (e.g. Fall Community Meeting). Drives the hero, the page, and the pinned banner item. */
export const livestream = defineType({
  name: "livestream",
  title: "Live stream",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "dateLabel", type: "string", description: "Shown as written, e.g. “Wednesday, October 14, 2026 · 6:00 PM”." }),
    defineField({ name: "href", title: "Page path", type: "string", initialValue: "/community-meeting" }),
    defineField({ name: "youtubeId", type: "string", validation: (r) => r.required() }),
    defineField({ name: "heroImage", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", type: "string", title: "Alt text" })] }),
    defineField({ name: "heroBlurb", type: "text", rows: 3 }),
    defineField({ name: "featuredUntil", title: "Feature until", type: "datetime", description: "After this the hero and banner stop featuring it." }),
    defineField({ name: "body", type: "body" }),
  ],
  preview: { select: { title: "title", subtitle: "dateLabel", media: "heroImage" } },
});

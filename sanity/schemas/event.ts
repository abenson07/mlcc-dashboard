import { defineField, defineType } from "sanity";

/**
 * Public event page. Sanity owns the details; the dashboard keeps an anchor row in
 * Supabase (`public.events.sanity_id`) plus a read-only copy of title/start/end.
 */
export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title", maxLength: 96 }, validation: (r) => r.required() }),
    defineField({
      name: "supabaseEventId",
      title: "Admin event ID",
      type: "string",
      readOnly: true,
      description: "Set automatically when the event is created in the admin. Do not edit.",
    }),
    defineField({ name: "startsAt", title: "Starts", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "endsAt", title: "Ends", type: "datetime" }),
    defineField({ name: "category", type: "string" }),
    defineField({ name: "locationName", title: "Location", type: "string" }),
    defineField({ name: "mapQuery", title: "Map search text", type: "string", description: "Defaults to the location plus Seattle, WA." }),
    defineField({ name: "mapZoom", type: "number", initialValue: 15, validation: (r) => r.min(1).max(21) }),
    defineField({ name: "shortDescription", type: "text", rows: 3 }),
    defineField({ name: "image", title: "Cover image", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", type: "string", title: "Alt text" })] }),
    defineField({ name: "imageAspect", type: "string", options: { list: ["landscape", "portrait"], layout: "radio" }, initialValue: "landscape" }),
    defineField({ name: "imagePosition", type: "string", options: { list: ["left", "right"], layout: "radio" }, initialValue: "left", hidden: ({ document }) => document?.imageAspect !== "portrait" }),
    defineField({ name: "body", type: "body" }),
    defineField({ name: "externalUrl", title: "External link", type: "url", description: "If set, the event card links here instead of a detail page." }),
  ],
  orderings: [{ title: "Start, soonest first", name: "startsAsc", by: [{ field: "startsAt", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "startsAt", media: "image" } },
});

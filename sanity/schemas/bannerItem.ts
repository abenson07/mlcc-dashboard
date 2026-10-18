import { defineField, defineType } from "sanity";

/** Hand-pinned banner entries. Upcoming events, stories and volunteer asks are added automatically by the site. */
export const bannerItem = defineType({
  name: "bannerItem",
  title: "Banner item",
  type: "document",
  fields: [
    defineField({ name: "headline", type: "string", validation: (r) => r.required() }),
    defineField({ name: "linkText", type: "string", validation: (r) => r.required() }),
    defineField({ name: "linkPath", title: "Link", type: "string", description: "Site path like /community-meeting, or a full URL.", validation: (r) => r.required() }),
    defineField({ name: "pinned", title: "Pin to the front", type: "boolean", initialValue: false }),
    defineField({ name: "expiresAt", title: "Hide after", type: "datetime", description: "Leave empty to show until removed." }),
  ],
  preview: { select: { title: "headline", subtitle: "linkPath" } },
});

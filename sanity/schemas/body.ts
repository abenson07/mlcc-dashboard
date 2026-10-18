import { defineArrayMember, defineField, defineType } from "sanity";

/** Rich body shared by events, livestream and (later) pages. Replaces the hand-written `blocks` arrays in mlcc-website/data. */
export const body = defineType({
  name: "body",
  title: "Body",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Paragraph", value: "normal" },
        { title: "Heading", value: "h3" },
        { title: "Subheading", value: "h4" },
      ],
      lists: [{ title: "Bulleted", value: "bullet" }],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [
          defineField({
            name: "link",
            type: "object",
            title: "Link",
            fields: [defineField({ name: "href", type: "url", title: "URL", validation: (r) => r.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }) })],
          }),
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", type: "string", title: "Alt text", validation: (r) => r.required() }),
        defineField({ name: "caption", type: "string", title: "Caption" }),
      ],
    }),
    defineArrayMember({
      name: "youtube",
      type: "object",
      title: "YouTube video",
      fields: [
        defineField({ name: "youtubeId", type: "string", title: "YouTube ID", validation: (r) => r.required() }),
        defineField({ name: "title", type: "string", title: "Title", validation: (r) => r.required() }),
      ],
      preview: { select: { title: "title", subtitle: "youtubeId" } },
    }),
  ],
});

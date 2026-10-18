import { sanityClient } from "sanity:client";
import imageUrlBuilder from "@sanity/image-url";
import { toHTML, type PortableTextComponents } from "@portabletext/to-html";

const readToken = import.meta.env.SANITY_API_READ_TOKEN;

/** Published content only. Used at build time and for static pages. */
export function fetchPublished<T>(query: string, params: Record<string, unknown> = {}) {
  return sanityClient.fetch<T>(query, params, { perspective: "published" });
}

/** Drafts included. Needs the Viewer token; only call from routes with `prerender = false`. */
export function fetchDrafts<T>(query: string, params: Record<string, unknown> = {}) {
  return sanityClient.withConfig({ token: readToken }).fetch<T>(query, params, { perspective: "drafts" });
}

const builder = imageUrlBuilder(sanityClient);
export const urlFor = (source: unknown) => builder.image(source as never).auto("format");

/** Sized image URL for a Sanity image field (keeps hotspot cropping when width+height are given). */
export function imageSrc(source: unknown, width: number, height?: number) {
  if (!source) return undefined;
  let img = urlFor(source).width(width);
  if (height) img = img.height(height).fit("crop");
  return img.url();
}

/* ---- Portable Text → HTML, styled to match the existing event pages ---- */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const bodyComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => `<p class="mb-4 text-base leading-6">${children}</p>`,
    h3: ({ children }) =>
      `<h2 class="mb-3 mt-4 font-display text-[1.75rem] leading-8 font-bold tracking-[-0.0625rem] text-puget-night">${children}</h2>`,
    h4: ({ children }) =>
      `<h2 class="mb-3 mt-4 font-display text-[1.75rem] leading-8 font-bold tracking-[-0.0625rem] text-puget-night">${children}</h2>`,
  },
  list: {
    bullet: ({ children }) => `<ul class="mb-4 list-disc pl-6" role="list">${children}</ul>`,
  },
  listItem: {
    bullet: ({ children }) => `<li class="text-base leading-6">${children}</li>`,
  },
  marks: {
    link: ({ children, value }) =>
      `<a href="${esc(value?.href ?? "#")}" target="_blank" rel="noopener noreferrer" class="text-sparkles-navy underline decoration-1 underline-offset-2 hover:no-underline">${children}</a>`,
  },
  types: {
    image: ({ value }) => {
      const src = imageSrc(value, 1600);
      if (!src) return "";
      return `<figure class="mb-4 w-full"><img loading="lazy" src="${esc(src)}" alt="${esc(value.alt ?? "")}" class="w-full rounded-xl object-cover" />${
        value.caption ? `<figcaption class="mt-2 text-sm opacity-70">${esc(value.caption)}</figcaption>` : ""
      }</figure>`;
    },
    youtube: ({ value }) =>
      `<div class="mb-4 aspect-[16/9] w-full overflow-hidden rounded-xl"><iframe title="${esc(value.title ?? "Video")}" src="https://www.youtube-nocookie.com/embed/${esc(value.youtubeId)}" class="h-full w-full border-0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`,
  },
};

export function renderBody(blocks: unknown): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";
  return toHTML(blocks as never, { components: bodyComponents });
}

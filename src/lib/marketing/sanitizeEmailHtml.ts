import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "a",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "img",
];

/**
 * Sanitize rich HTML from the editor before sending to Resend.
 * Preserves Resend merge tags like {{{RESEND_UNSUBSCRIBE_URL}}} inside href/text.
 */
export function sanitizeEmailHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowVulnerableTags: false,
    exclusiveFilter(frame) {
      if (frame.tag !== "img") return false;
      const raw = frame.attribs.src ?? "";
      const src = raw.trim().toLowerCase();
      if (!src) return true;
      if (src.startsWith("https:")) return false;
      return !raw.includes("{{");
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const lower = href.trim().toLowerCase();
        if (
          lower.startsWith("javascript:") ||
          lower.startsWith("data:") ||
          (lower !== "" &&
            !lower.startsWith("https:") &&
            !lower.startsWith("mailto:") &&
            !(href.includes("{{") && href.includes("}}")))
        ) {
          return { tagName, attribs: { ...attribs, href: "" } };
        }
        return {
          tagName,
          attribs: {
            ...attribs,
            rel: "noopener noreferrer",
            target: attribs.target === "_blank" ? "_blank" : attribs.target,
          },
        };
      },
    },
  });
}

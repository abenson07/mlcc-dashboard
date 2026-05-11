/**
 * Webflow Data API v2: Rich Text fields accept an HTML string.
 * Dashboard forms use plain text in textareas; convert on read/write.
 */

function escapeHtmlForTextNode(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain → simple <p> / <br/> HTML safe for Webflow Rich Text. */
export function plainTextToEventRichTextHtml(text: string): string {
  const t = String(text ?? "").replace(/\r\n/g, "\n").trim();
  if (!t) return "";
  return t
    .split(/\n\s*\n/)
    .map((para) => {
      const inner = escapeHtmlForTextNode(para.trim()).replace(/\n/g, "<br/>");
      return `<p>${inner}</p>`;
    })
    .join("");
}

/** Strip HTML / parse API shapes for editing as plain text. */
export function richTextValueToPlain(raw: unknown): string {
  if (raw == null || raw === "") return "";
  let html = "";
  if (typeof raw === "string") {
    html = raw;
  } else if (typeof raw === "object" && raw !== null && "html" in raw) {
    const h = (raw as { html: unknown }).html;
    html = typeof h === "string" ? h : "";
  } else {
    return String(raw);
  }
  if (!html.trim()) return "";
  return html
    .replace(/\r\n/g, "\n")
    .replace(/<\/p>\s*/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

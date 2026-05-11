/** Same rules as src/lib/webflow/richTextPlain.ts (Node scripts cannot import TS). */

function escapeHtmlForTextNode(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function plainTextToEventRichTextHtml(text) {
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

export function richTextValueToPlain(raw) {
  if (raw == null || raw === "") return "";
  let html = "";
  if (typeof raw === "string") {
    html = raw;
  } else if (typeof raw === "object" && raw !== null && "html" in raw) {
    const h = raw.html;
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

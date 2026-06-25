import type { EditableAnchor, EditableType } from "./types";

const STYLE_ID = "site-feedback-comment-mode-styles";
const LABEL_ID = "site-feedback-hover-label";
const HOVER_CLASS = "site-feedback-hover";

const SKIP_TAGS = new Set([
  "HTML",
  "HEAD",
  "BODY",
  "SCRIPT",
  "STYLE",
  "META",
  "LINK",
  "NOSCRIPT",
  "PATH",
  "G",
  "CIRCLE",
  "ELLIPSE",
  "LINE",
  "POLYGON",
  "POLYLINE",
  "RECT",
  "TEXT",
  "TSPAN",
  "USE",
  "DEFS",
  "CLIPPATH",
  "MASK",
  "PATTERN",
  "SYMBOL",
  "BR",
  "HR",
  "IFRAME",
]);

const TEXT_TAGS = new Set([
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "P",
  "SPAN",
  "LABEL",
  "LI",
  "TD",
  "TH",
  "STRONG",
  "EM",
  "SMALL",
  "BLOCKQUOTE",
  "FIGCAPTION",
]);

const SECTION_TAGS = new Set([
  "SECTION",
  "ARTICLE",
  "MAIN",
  "HEADER",
  "FOOTER",
  "NAV",
  "ASIDE",
  "DIV",
  "FORM",
  "UL",
  "OL",
  "FIGURE",
  "TABLE",
]);

function isAllowedType(value: string | null): value is EditableType {
  return value === "text" || value === "button" || value === "image" || value === "section";
}

export function inferEditableType(el: HTMLElement): EditableType {
  const fromAttr = el.getAttribute("data-editable-type");
  if (isAllowedType(fromAttr)) return fromAttr;

  const tag = el.tagName;
  if (tag === "IMG" || tag === "PICTURE" || tag === "VIDEO" || tag === "SVG") return "image";
  if (
    tag === "A" ||
    tag === "BUTTON" ||
    (tag === "INPUT" &&
      ["button", "submit", "reset"].includes((el as HTMLInputElement).type)) ||
    el.getAttribute("role") === "button"
  ) {
    return "button";
  }
  if (TEXT_TAGS.has(tag)) return "text";
  if (SECTION_TAGS.has(tag)) return "section";
  return "section";
}

function visibleText(el: HTMLElement): string {
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function buildElementLabel(el: HTMLElement): string {
  const fromAttr = el.getAttribute("data-editable-label");
  if (fromAttr?.trim()) return fromAttr.trim();

  const fromId = el.getAttribute("data-editable-id");
  if (fromId?.trim()) return fromId.trim();

  const tag = el.tagName.toLowerCase();
  const type = inferEditableType(el);

  if (type === "image") {
    const alt = el.getAttribute("alt")?.trim();
    if (alt) return `Image: ${alt}`;
    const aria = el.getAttribute("aria-label")?.trim();
    if (aria) return `Image: ${aria}`;
    return el.tagName === "SVG" ? "SVG" : "Image";
  }

  const text = visibleText(el);
  if (text) {
    const snippet = text.length > 48 ? `${text.slice(0, 48)}…` : text;
    if (type === "button") return `Button: ${snippet}`;
    if (type === "text") return snippet;
    return `${tag}: ${snippet}`;
  }

  const aria = el.getAttribute("aria-label")?.trim();
  if (aria) return aria;

  return tag;
}

/** Extract anchor metadata from any element. Honors data-editable-* when present. */
export function extractEditableAnchor(el: HTMLElement): EditableAnchor {
  const editableType = inferEditableType(el);
  const text =
    editableType === "image"
      ? el.getAttribute("alt") ?? visibleText(el)
      : visibleText(el);

  return {
    editableId: el.getAttribute("data-editable-id") ?? undefined,
    editableType,
    editableLabel: buildElementLabel(el),
    textSnippet: text.slice(0, 80) || undefined,
  };
}

function asElement(target: EventTarget | null): HTMLElement | null {
  const node = target as Node | null;
  if (node && node.nodeType === 1) return node as HTMLElement;
  return null;
}

function isCommentTarget(el: HTMLElement): boolean {
  if (SKIP_TAGS.has(el.tagName)) return false;
  if (typeof el.getBoundingClientRect !== "function") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function getCommentTarget(doc: Document, target: EventTarget | null): HTMLElement | null {
  let el = asElement(target);
  while (el && el !== doc.documentElement) {
    if (isCommentTarget(el)) return el;
    el = el.parentElement;
  }
  return null;
}

function ensureStyles(doc: Document) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .${HOVER_CLASS} {
      outline: 2px solid #2563eb !important;
      outline-offset: 2px;
      cursor: crosshair !important;
    }
    #${LABEL_ID} {
      position: fixed;
      z-index: 2147483646;
      pointer-events: none;
      padding: 4px 8px;
      border-radius: 6px;
      background: #18181b;
      color: #fafafa;
      font: 500 11px/1.2 Inter, system-ui, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      max-width: 280px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;
  doc.head.appendChild(style);
}

function ensureLabel(doc: Document): HTMLElement {
  let label = doc.getElementById(LABEL_ID);
  if (!label) {
    label = doc.createElement("div");
    label.id = LABEL_ID;
    doc.body.appendChild(label);
  }
  return label;
}

export function attachCommentMode(
  doc: Document,
  win: Window,
  onSelect: (anchor: EditableAnchor) => void,
): () => void {
  ensureStyles(doc);
  const label = ensureLabel(doc);
  let hovered: HTMLElement | null = null;

  function clearHover() {
    if (hovered) {
      hovered.classList.remove(HOVER_CLASS);
      hovered = null;
    }
    label.style.display = "none";
  }

  function onMouseMove(event: MouseEvent) {
    const target = getCommentTarget(doc, event.target);
    if (!target) {
      clearHover();
      return;
    }
    if (hovered !== target) {
      if (hovered) hovered.classList.remove(HOVER_CLASS);
      hovered = target;
      hovered.classList.add(HOVER_CLASS);
    }
    const anchor = extractEditableAnchor(target);
    label.textContent = `${anchor.editableLabel} (${anchor.editableType})`;
    label.style.display = "block";
    label.style.left = `${Math.min(event.clientX + 12, win.innerWidth - 280)}px`;
    label.style.top = `${Math.max(event.clientY - 28, 8)}px`;
  }

  function onClick(event: MouseEvent) {
    const target = getCommentTarget(doc, event.target);
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect(extractEditableAnchor(target));
  }

  doc.addEventListener("mousemove", onMouseMove, true);
  doc.addEventListener("click", onClick, true);

  return () => {
    doc.removeEventListener("mousemove", onMouseMove, true);
    doc.removeEventListener("click", onClick, true);
    clearHover();
    label.remove();
    doc.getElementById(STYLE_ID)?.remove();
  };
}

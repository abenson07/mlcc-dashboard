import type { CSSProperties } from "react";

/**
 * Inline styles for deliverer action buttons/links.
 *
 * Applied inline (not just via className) because this admin section loads
 * both leaflet.css and the older integrated.css, which both define
 * `.lf-btn--primary` / `.lf-link` — the cascade order between them is not
 * reliable, so class names alone don't guarantee the right look. Keep this
 * as the single source of truth for these colors: link = accent, primary
 * action = black, destructive = red.
 */

export const linkBtnStyle: CSSProperties = {
  border: "none",
  background: "none",
  padding: 0,
  color: "var(--lf-accent)",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
};

export const primaryBtnStyle: CSSProperties = {
  display: "inline-flex",
  width: "auto",
  flexShrink: 0,
  border: "none",
  borderRadius: 6,
  background: "var(--lf-text)",
  color: "#fff",
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
};

export const outlineBtnStyle: CSSProperties = {
  display: "inline-flex",
  width: "auto",
  flexShrink: 0,
  border: "1px solid var(--lf-canvas-border)",
  borderRadius: 6,
  background: "var(--lf-card)",
  color: "var(--lf-text)",
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
};

export const destructiveBtnStyle: CSSProperties = {
  display: "inline-flex",
  width: "auto",
  flexShrink: 0,
  border: "1px solid var(--lf-red)",
  borderRadius: 6,
  background: "#fef2f2",
  color: "var(--lf-red)",
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
};

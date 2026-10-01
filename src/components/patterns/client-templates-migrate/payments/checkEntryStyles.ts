import type { CSSProperties } from "react";

export const fieldInputStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  height: 40,
  paddingInline: 12,
  borderRadius: 8,
  border: "var(--linear-border-width) solid var(--linear-color-hairline-strong)",
  background: "var(--linear-color-background)",
  color: "var(--linear-color-ink)",
  fontSize: 14,
  fontFamily: "inherit",
};

export const fieldLabelStyle: CSSProperties = {
  fontSize: 13,
  color: "var(--linear-color-ink-subtle)",
};

export const cardStyle: CSSProperties = {
  boxSizing: "border-box",
  borderRadius: 16,
  border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
  background: "var(--linear-color-panel)",
  padding: 24,
};

export const linkButtonStyle: CSSProperties = {
  all: "unset",
  cursor: "pointer",
  fontSize: 13,
  color: "var(--linear-color-accent)",
  borderRadius: 4,
};

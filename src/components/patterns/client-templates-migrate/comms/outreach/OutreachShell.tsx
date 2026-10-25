"use client";

import { useEffect, type ReactNode } from "react";
import { ArrowLeft, X } from "lucide-react";
import { IconButton } from "@/components/patterns/primitives/IconButton";

export type OutreachShellProps = {
  steps?: string[];
  /** Index into `steps` of the current step. */
  step?: number;
  onClose: () => void;
  onBack?: () => void;
  left: ReactNode;
  right: ReactNode;
  /** Small label above the right pane, e.g. "Facebook preview". */
  rightLabel?: ReactNode;
};

/**
 * Full-screen two-pane composer: inputs on the left, live preview on the right.
 * Identical in demo and live mode.
 */
export function OutreachShell({ steps, step = 0, onClose, onBack, left, right, rightLabel }: OutreachShellProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="New outreach"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        display: "flex",
        background: "var(--linear-color-background)",
        color: "var(--linear-color-ink)",
        fontFamily: "inherit",
      }}
    >
      <div style={{ flex: "1 1 50%", minWidth: 0, overflowY: "auto", padding: "32px 24px 48px" }}>
        <div style={{ maxWidth: 560, marginInline: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, minHeight: 28 }}>
            {onBack ? (
              <IconButton label="Back" icon={<ArrowLeft size={16} />} onClick={onBack} size="sm" />
            ) : null}
            {steps ? (
              <nav aria-label="Progress" style={{ display: "flex", gap: 6, fontSize: 12, flexWrap: "wrap" }}>
                {steps.map((label, i) => (
                  <span
                    key={label}
                    aria-current={i === step ? "step" : undefined}
                    style={{
                      color: i === step ? "var(--linear-color-ink)" : "var(--linear-color-ink-tertiary)",
                      fontWeight: i === step ? 510 : 400,
                    }}
                  >
                    {i > 0 ? <span style={{ marginRight: 6, opacity: 0.6 }}>›</span> : null}
                    {label}
                  </span>
                ))}
              </nav>
            ) : null}
          </div>
          {left}
        </div>
      </div>

      <div
        style={{
          flex: "1 1 50%",
          minWidth: 0,
          margin: 12,
          marginLeft: 0,
          borderRadius: "var(--linear-radius-lg)",
          background: "var(--linear-color-surface-1)",
          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          position: "relative",
          overflowY: "auto",
          padding: "32px 28px 48px",
        }}
      >
        <div style={{ position: "absolute", top: 12, right: 12 }}>
          <IconButton label="Close" icon={<X size={16} />} onClick={onClose} />
        </div>
        {rightLabel ? (
          <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)", marginBottom: 12, paddingRight: 36 }}>
            {rightLabel}
          </div>
        ) : null}
        {right}
      </div>
    </div>
  );
}

/** Empty-state block for the right pane. */
export function PreviewPlaceholder({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        height: "100%",
        minHeight: 240,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        color: "var(--linear-color-ink-subtle)",
        fontSize: 13,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 120,
          height: 80,
          borderRadius: 8,
          border: "var(--linear-border-width) dashed var(--linear-color-hairline-strong)",
        }}
      />
      {children}
    </div>
  );
}

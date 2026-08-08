"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "@/components/patterns/shared/IconButton";

export type OutlinedPanelProps = {
  children: ReactNode;
  width?: number | string;
  /** When set, shows a close X top-right and closes on Escape. */
  onClose?: () => void;
};

/**
 * Side-content variant that reads as its own floating card — white with a
 * soft shadow in light mode, a bordered dark surface in dark mode (measured
 * off linear.app's Health/Initiatives panel) — rather than sitting flush
 * like `SideContentBar`. Follows the app's light/dark mode like everything
 * else via the `--linear-color-panel*` tokens.
 */
export function OutlinedPanel({ children, width = 320, onClose }: OutlinedPanelProps) {
  useEffect(() => {
    if (!onClose) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="complementary"
      style={{
        boxSizing: "border-box",
        width,
        flexShrink: 0,
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        background: "var(--linear-color-panel)",
        border:
          "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-lg)",
        boxShadow: "var(--linear-shadow-panel)",
        padding: 16,
      }}
    >
      {onClose ? (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <IconButton
            label="Close"
            variant="ghost"
            size="sm"
            icon={<X size={16} strokeWidth={1.75} />}
            onClick={onClose}
          />
        </div>
      ) : null}
      {children}
    </div>
  );
}

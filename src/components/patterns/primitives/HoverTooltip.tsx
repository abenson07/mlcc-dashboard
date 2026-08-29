"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type HoverTooltipProps = {
  content: string;
  children: ReactNode;
};

const GAP = 8;

function themeRoot(from: HTMLElement | null): HTMLElement {
  return from?.closest("[data-linear-theme]") ?? document.body;
}

/**
 * Hover/focus tooltip with a fixed-position surface (not the native `title`
 * tooltip). Portaled onto the Linear theme root so token colors apply and
 * overflow:auto ancestors cannot clip it.
 */
export function HoverTooltip({ content, children }: HoverTooltipProps) {
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({
      top: rect.bottom + GAP,
      left: rect.left + rect.width / 2,
    });
  }, []);

  function show() {
    place();
    setOpen(true);
  }

  function hide() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onScrollOrResize() {
      place();
    }
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, place]);

  const host = typeof document !== "undefined" ? themeRoot(triggerRef.current) : null;

  const bubbleStyle: CSSProperties = {
    position: "fixed",
    top: coords?.top ?? 0,
    left: coords?.left ?? 0,
    transform: "translateX(-50%)",
    zIndex: 400,
    maxWidth: 280,
    padding: "6px 8px",
    borderRadius: 6,
    background: "var(--linear-color-ink)",
    color: "var(--linear-color-canvas)",
    fontSize: 12,
    lineHeight: "16px",
    boxShadow: "var(--linear-shadow-panel)",
    pointerEvents: "none",
    whiteSpace: "pre-wrap",
  };

  return (
    <span
      ref={triggerRef}
      tabIndex={0}
      aria-describedby={open ? id : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      style={{ display: "inline-flex", verticalAlign: "middle", cursor: "help" }}
    >
      {children}
      {open && coords && host
        ? createPortal(
            <span id={id} role="tooltip" style={bubbleStyle}>
              {content}
            </span>,
            host,
          )
        : null}
    </span>
  );
}

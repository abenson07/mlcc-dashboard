"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  computePopoverPosition,
  resolvePopoverWidth,
  type PopoverAlignment,
  type PopoverPlacement,
} from "./popoverPosition";

export type LayerPlacement = PopoverPlacement;
export type LayerAlignment = PopoverAlignment;

export type PopoverProps = {
  trigger?: ReactNode;
  children?: ReactNode;
  content: ReactNode;
  label?: string;
  placement?: LayerPlacement;
  alignment?: LayerAlignment;
  width?: number | string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hasCloseButton?: boolean;
  style?: CSSProperties;
  /**
   * Render the surface in a fixed-position layer on the Linear theme root so
   * overflow-clipping ancestors (table cells, scroll areas, panels) can never
   * cut it off. On by default; pass `false` to render it inline instead.
   */
  portal?: boolean;
};

function themeRoot(from: HTMLElement | null): HTMLElement {
  return from?.closest<HTMLElement>("[data-linear-theme]") ?? document.body;
}

const alignmentStyle: Record<LayerAlignment, CSSProperties> = {
  start: { left: 0 },
  end: { right: 0 },
  center: { left: "50%", transform: "translateX(-50%)" },
};

/** Trigger-anchored popover surface — click-outside and Escape close it. */
export function Popover({
  children,
  content,
  label,
  placement = "below",
  alignment = "start",
  width,
  isOpen,
  onOpenChange,
  style,
  portal = true,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : uncontrolledOpen;
  const containerRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
  // Percent widths (e.g. "100%") follow the trigger, not the window.
  const surfaceWidth = resolvePopoverWidth(width, triggerWidth);

  const place = useCallback(() => {
    const trigger = containerRef.current;
    const surface = surfaceRef.current;
    if (!trigger || !surface) return;
    const t = trigger.getBoundingClientRect();
    setTriggerWidth(t.width);
    const s = surface.getBoundingClientRect();
    const next = computePopoverPosition({
      trigger: t,
      surface: { width: s.width, height: s.height },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      placement,
      alignment,
    });
    setPos({ top: next.top, left: next.left });
  }, [placement, alignment]);

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !surfaceRef.current?.contains(target)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Measure and place before paint so the menu never flashes in the wrong spot.
  useLayoutEffect(() => {
    if (!open || !portal) return;
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      setPos(null);
    };
  }, [open, portal, place, surfaceWidth]);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-flex" }}>
      <div onClick={() => setOpen(!open)}>{children}</div>
      {open && portal
        ? createPortal(
            <div
              ref={surfaceRef}
              role="presentation"
              aria-label={label}
              style={{
                position: "fixed",
                zIndex: 400,
                width: surfaceWidth,
                top: pos?.top ?? 0,
                left: pos?.left ?? 0,
                visibility: pos ? "visible" : "hidden",
                ...style,
              }}
            >
              {content}
            </div>,
            themeRoot(containerRef.current),
          )
        : null}
      {open && !portal ? (
        <div
          role="presentation"
          aria-label={label}
          style={{
            position: "absolute",
            zIndex: 50,
            width,
            [placement === "below" ? "top" : "bottom"]: "calc(100% + 4px)",
            ...alignmentStyle[alignment],
            ...style,
          }}
        >
          {content}
        </div>
      ) : null}
    </div>
  );
}

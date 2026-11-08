"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type LayerPlacement = "below" | "above";
export type LayerAlignment = "start" | "end" | "center";

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
   * Render the surface in a fixed-position portal on the Linear theme root, so
   * overflow-clipping ancestors (table cells, scroll areas) cannot cut it off.
   */
  portal?: boolean;
};

const GAP = 4;

function themeRoot(from: HTMLElement | null): HTMLElement {
  return from?.closest<HTMLElement>("[data-linear-theme]") ?? document.body;
}

const alignmentStyle: Record<LayerAlignment, CSSProperties> = {
  start: { left: 0 },
  end: { right: 0 },
  center: { left: "50%", transform: "translateX(-50%)" },
};

/** Trigger-anchored popover surface — click-outside closes when uncontrolled. */
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
  portal = false,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : uncontrolledOpen;
  const containerRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [fixedPos, setFixedPos] = useState<CSSProperties | null>(null);

  const place = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pos: CSSProperties =
      placement === "below"
        ? { top: rect.bottom + GAP }
        : { bottom: window.innerHeight - rect.top + GAP };
    if (alignment === "end") pos.right = window.innerWidth - rect.right;
    else if (alignment === "center") {
      pos.left = rect.left + rect.width / 2;
      pos.transform = "translateX(-50%)";
    } else pos.left = rect.left;
    setFixedPos(pos);
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
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !portal) return;
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, portal, place]);

  if (portal) {
    return (
      <div ref={containerRef} style={{ position: "relative", display: "inline-flex" }}>
        <div onClick={() => setOpen(!open)}>{children}</div>
        {open && fixedPos
          ? createPortal(
              <div
                ref={surfaceRef}
                role="presentation"
                aria-label={label}
                style={{ position: "fixed", zIndex: 400, width, ...fixedPos, ...style }}
              >
                {content}
              </div>,
              themeRoot(containerRef.current),
            )
          : null}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-flex" }}>
      <div onClick={() => setOpen(!open)}>{children}</div>
      {open ? (
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

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MIN_WIDTH = 200;
const MAX_HEIGHT = 260;
const VIEWPORT_MARGIN = 8;
const GAP = 4;

type PopoverPosition = {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  container: Element;
};

type PropertyPopoverProps = {
  open: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
};

export default function PropertyPopover({ open, onClose, trigger, children }: PropertyPopoverProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<PopoverPosition | null>(null);

  useLayoutEffect(() => {
    if (!open) return;

    function measure() {
      const el = anchorRef.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const width = Math.min(Math.max(box.width, MIN_WIDTH), vw - VIEWPORT_MARGIN * 2);
      let left = box.left;
      if (left + width > vw - VIEWPORT_MARGIN) left = vw - VIEWPORT_MARGIN - width;
      if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;

      const spaceBelow = vh - box.bottom;
      const spaceAbove = box.top;
      const flipAbove = spaceBelow < MAX_HEIGHT + GAP && spaceAbove > spaceBelow;

      setPosition({
        left,
        width,
        top: flipAbove ? undefined : box.bottom + GAP,
        bottom: flipAbove ? vh - box.top + GAP : undefined,
        container: el.closest(".shell-app") ?? document.body,
      });
    }

    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onClose();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <div className="shell-widget-popover-anchor" ref={anchorRef}>
      {trigger}
      {open &&
        position &&
        createPortal(
          <div
            className="shell-widget-popover"
            ref={panelRef}
            style={{
              left: position.left,
              width: position.width,
              top: position.top,
              bottom: position.bottom,
            }}
          >
            {children}
          </div>,
          position.container,
        )}
    </div>
  );
}

"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { outlineBtnStyle } from "../deliverers/actionButtonStyles";
import DelivererPicker from "./DelivererPicker";

type DelivererCellProps = {
  personName?: string | null;
  personAddress?: string | null;
  excludePersonId?: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (person: { id: string; name: string }) => void;
};

const MENU_WIDTH = 260;
const MENU_MAX_HEIGHT = 320;
const VIEWPORT_MARGIN = 8;
const GAP = 4;

export default function DelivererCell({
  personName,
  personAddress,
  excludePersonId,
  isOpen,
  onToggle,
  onClose,
  onSelect,
}: DelivererCellProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const [portalRoot, setPortalRoot] = useState<Element | null>(null);

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuStyle(null);
      setPortalRoot(null);
      return;
    }

    function measure() {
      const el = anchorRef.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let left = box.left;
      if (left + MENU_WIDTH > vw - VIEWPORT_MARGIN) {
        left = Math.max(VIEWPORT_MARGIN, vw - VIEWPORT_MARGIN - MENU_WIDTH);
      }

      const spaceBelow = vh - box.bottom;
      const spaceAbove = box.top;
      const flipAbove = spaceBelow < MENU_MAX_HEIGHT + GAP && spaceAbove > spaceBelow;

      // Portal into .shell-app so --lf-* tokens still apply; fixed pos escapes overflow clip.
      setPortalRoot(el.closest(".shell-app") ?? document.body);
      setMenuStyle({
        position: "fixed",
        zIndex: 1000,
        left,
        right: "auto",
        width: MENU_WIDTH,
        top: flipAbove ? undefined : box.bottom + GAP,
        bottom: flipAbove ? vh - box.top + GAP : undefined,
        maxHeight: MENU_MAX_HEIGHT,
        overflow: "auto",
        marginTop: 0,
        padding: 8,
      });
    }

    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [isOpen]);

  return (
    <td>
      <div className="lf-selector" ref={anchorRef}>
        {personName ? (
          <button
            type="button"
            className="lf-table-deliverer-trigger"
            style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            <span className="lf-table-title">{personName}</span>
            {personAddress && <span className="lf-table-subtitle">{personAddress}</span>}
          </button>
        ) : (
          <button
            type="button"
            className="lf-btn lf-btn--outline"
            style={outlineBtnStyle}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            Assign deliverer
          </button>
        )}
        {isOpen &&
          menuStyle &&
          portalRoot &&
          createPortal(
            <>
              <div
                className="lf-selector-backdrop"
                style={{ zIndex: 999 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              />
              <div
                className="lf-selector-menu"
                style={menuStyle}
                onClick={(e) => e.stopPropagation()}
              >
                <DelivererPicker excludePersonId={excludePersonId} onSelect={onSelect} onCancel={onClose} />
              </div>
            </>,
            portalRoot,
          )}
      </div>
    </td>
  );
}

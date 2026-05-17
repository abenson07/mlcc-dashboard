"use client";
import type React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  /** When set with `usePortal`, positions the menu in the viewport (avoids table overflow clipping). */
  anchorRef?: React.RefObject<HTMLElement | null>;
  usePortal?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  anchorRef,
  usePortal = false,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!isOpen || !usePortal || !anchorRef?.current) {
      setPosition(null);
      return;
    }
    const update = () => {
      const rect = anchorRef.current!.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, left: rect.right });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen, usePortal, anchorRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !target.closest(".dropdown-toggle")
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;
  if (usePortal && !position) return null;

  const panelClass = `rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${className}`;

  const menu = (
    <div
      ref={dropdownRef}
      className={
        usePortal
          ? `fixed z-50 -translate-x-full ${panelClass}`
          : `absolute right-0 z-40 mt-2 ${panelClass}`
      }
      style={usePortal && position ? { top: position.top, left: position.left } : undefined}
    >
      {children}
    </div>
  );

  if (usePortal && typeof document !== "undefined") {
    return createPortal(menu, document.body);
  }

  return menu;
};

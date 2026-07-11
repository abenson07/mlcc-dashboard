"use client";

import type { ReactNode } from "react";

type WidgetActionButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  hidden?: boolean;
  variant?: "solid" | "neutral";
};

export default function WidgetActionButton({
  children,
  onClick,
  disabled,
  hidden,
  variant = "solid",
}: WidgetActionButtonProps) {
  return (
    <button
      type="button"
      className={[
        variant === "solid" ? "shell-widget-send-btn" : "shell-widget-send-btn shell-widget-send-btn--neutral",
        hidden ? "shell-widget-send-btn--hidden" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

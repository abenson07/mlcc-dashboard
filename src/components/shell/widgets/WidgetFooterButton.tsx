import type { ButtonHTMLAttributes, ReactNode } from "react";

type WidgetFooterButtonProps = {
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function WidgetFooterButton({
  children,
  className,
  type = "button",
  ...rest
}: WidgetFooterButtonProps) {
  return (
    <button
      type={type}
      className={className ? `shell-widget-footer-btn ${className}` : "shell-widget-footer-btn"}
      {...rest}
    >
      {children}
    </button>
  );
}

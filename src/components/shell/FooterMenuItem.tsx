import type { ReactNode } from "react";

type FooterMenuItemProps = {
  icon: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  tooltip?: string;
};

export default function FooterMenuItem({ icon, label, href, onClick, tooltip }: FooterMenuItemProps) {
  if (href) {
    return (
      <a className="shell-footer-item shell-tooltip" href={href} data-tooltip={tooltip}>
        {icon}
        <span>{label}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      className="shell-footer-item shell-tooltip"
      onClick={onClick}
      data-tooltip={tooltip}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

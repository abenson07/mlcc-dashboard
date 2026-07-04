import type { ReactNode } from "react";

type FooterMenuItemProps = {
  icon: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
};

export default function FooterMenuItem({ icon, label, href, onClick }: FooterMenuItemProps) {
  if (href) {
    return (
      <a className="shell-footer-item" href={href}>
        {icon}
        <span>{label}</span>
      </a>
    );
  }

  return (
    <button type="button" className="shell-footer-item" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

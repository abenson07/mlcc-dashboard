import type { ReactNode } from "react";

type PropertyRowProps = {
  label: string;
  children: ReactNode;
};

export default function PropertyRow({ label, children }: PropertyRowProps) {
  return (
    <div className="shell-widget-property-row">
      <span className="shell-widget-property-label">{label}</span>
      {children}
    </div>
  );
}

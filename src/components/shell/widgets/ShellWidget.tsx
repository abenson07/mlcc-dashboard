import type { ReactNode } from "react";

type ShellWidgetProps = {
  title: string;
  children: ReactNode;
};

export default function ShellWidget({ title, children }: ShellWidgetProps) {
  return (
    <section className="shell-widget">
      <h2 className="shell-widget-title">{title}</h2>
      <div className="shell-widget-content">{children}</div>
    </section>
  );
}

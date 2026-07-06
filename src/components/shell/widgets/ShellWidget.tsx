import type { ReactNode } from "react";

type ShellWidgetProps = {
  title: string;
  children: ReactNode;
  cardId?: string;
};

export default function ShellWidget({ title, children, cardId }: ShellWidgetProps) {
  return (
    <section className="shell-widget" data-lf-card={cardId}>
      <h2 className="shell-widget-title">{title}</h2>
      <div className="shell-widget-content">{children}</div>
    </section>
  );
}

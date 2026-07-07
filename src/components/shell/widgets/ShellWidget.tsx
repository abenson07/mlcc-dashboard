import type { ReactNode } from "react";

type ShellWidgetProps = {
  title: string;
  children: ReactNode;
  cardId?: string;
  headerAction?: ReactNode;
};

export default function ShellWidget({ title, children, cardId, headerAction }: ShellWidgetProps) {
  return (
    <section className="shell-widget" data-lf-card={cardId}>
      <div className="shell-widget-header">
        <h2 className="shell-widget-title">{title}</h2>
        {headerAction}
      </div>
      <div className="shell-widget-content">{children}</div>
    </section>
  );
}

import type { ReactNode } from "react";

type ShellWidgetProps = {
  title: string;
  children: ReactNode;
  widgetId?: string;
  headerAction?: ReactNode;
};

export default function ShellWidget({ title, children, widgetId, headerAction }: ShellWidgetProps) {
  return (
    <section className="shell-widget" data-widget-id={widgetId}>
      <div className="shell-widget-header">
        <h2 className="shell-widget-title">{title}</h2>
        {headerAction}
      </div>
      <div className="shell-widget-content">{children}</div>
    </section>
  );
}

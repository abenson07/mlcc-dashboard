"use client";

import { SHELL_WIDGET_CATALOG } from "./shellWidgetCatalog";

export default function ShellWidgetsShowcase() {
  return (
    <div className="shell-widgets-showcase">
      {SHELL_WIDGET_CATALOG.map(({ id, Component }) => (
        <Component key={id} />
      ))}
    </div>
  );
}

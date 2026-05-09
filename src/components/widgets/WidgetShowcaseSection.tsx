import React from "react";
import { CopyComponentName } from "./CopyComponentName";

/** Groups a demo block with a stable component name for prompts. */
export function WidgetShowcaseSection({
  componentName,
  title,
  description,
  children,
}: {
  componentName: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-mercury-line pb-4 sm:flex-row sm:items-start sm:justify-between dark:border-white/10">
        <div className="min-w-0 space-y-1">
          <h2 className="font-mercury-display text-mercury-h3 font-[450] text-mercury-ink dark:text-white/90">
            {title}
          </h2>
          {description ? (
            <p className="max-w-3xl text-mercury-caption text-mercury-muted dark:text-white/55">
              {description}
            </p>
          ) : null}
          <p className="font-mono text-mercury-caption text-mercury-muted dark:text-white/45">
            {componentName}
          </p>
        </div>
        <CopyComponentName name={componentName} />
      </div>
      <div>{children}</div>
    </section>
  );
}

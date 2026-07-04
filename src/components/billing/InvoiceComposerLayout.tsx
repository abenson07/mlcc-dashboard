"use client";

import type { ReactNode } from "react";

type InvoiceComposerLayoutProps = {
  form: ReactNode;
  preview: ReactNode;
  /** When true, fills the viewport (modal). When false, uses a fixed min-height for page use. */
  fullScreen?: boolean;
};

export default function InvoiceComposerLayout({
  form,
  preview,
  fullScreen = false,
}: InvoiceComposerLayoutProps) {
  const heightClass = fullScreen ? "h-screen" : "min-h-[calc(100vh-8rem)]";

  return (
    <div className={`flex ${heightClass} overflow-hidden bg-white dark:bg-gray-900`}>
      <div className="flex w-1/2 min-w-0 flex-col border-r border-gray-200 dark:border-gray-700">
        <div className="flex-1 overflow-y-auto">{form}</div>
      </div>
      <div className="flex w-1/2 min-w-0 flex-col overflow-hidden bg-gray-100 dark:bg-gray-950">
        {preview}
      </div>
    </div>
  );
}

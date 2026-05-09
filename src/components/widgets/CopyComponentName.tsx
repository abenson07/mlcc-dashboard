"use client";

import { CopyIcon } from "@/icons";
import { toast } from "sonner";
import React, { useCallback, useState } from "react";

export function CopyComponentName({
  name,
  label = "Copy name",
}: {
  name: string;
  label?: string;
}) {
  const [recent, setRecent] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(name);
      toast.success(`Copied "${name}"`);
      setRecent(true);
      window.setTimeout(() => setRecent(false), 1600);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }, [name]);

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`${label}: ${name}`}
      title={`${label}: ${name}`}
      className="inline-flex items-center gap-1.5 rounded-mercury-button border border-mercury-line bg-white px-2.5 py-1 text-mercury-caption font-medium text-mercury-ink shadow-none transition hover:bg-gray-50 dark:border-white/15 dark:bg-white/[0.04] dark:text-white/85 dark:hover:bg-white/[0.08]"
    >
      <CopyIcon className="size-3.5 shrink-0 opacity-70" aria-hidden />
      <span>{recent ? "Copied" : label}</span>
    </button>
  );
}

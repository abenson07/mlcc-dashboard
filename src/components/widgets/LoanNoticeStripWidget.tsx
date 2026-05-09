import React from "react";
import { DownloadIcon, PaperPlaneIcon } from "@/icons";

export function LoanNoticeStripWidget({
  variant,
  message,
  actionLabel,
  onAction,
  className = "",
}: {
  variant: "notification" | "download";
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  const icon =
    variant === "notification" ? (
      <PaperPlaneIcon className="size-5 text-mercury-muted dark:text-white/55" />
    ) : (
      <DownloadIcon className="size-5 text-mercury-muted dark:text-white/55" />
    );

  return (
    <div
      className={`flex items-center gap-3 rounded-full bg-gray-100 px-4 py-3 dark:bg-white/[0.06] ${className}`.trim()}
    >
      <span className="flex shrink-0">{icon}</span>
      <p className="min-w-0 flex-1 text-mercury-small text-mercury-ink dark:text-white/85">
        {message}
      </p>
      {variant === "notification" && actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 text-mercury-caption font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

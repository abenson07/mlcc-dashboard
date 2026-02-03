"use client";

import { toast } from "sonner";

interface CopyableEmailProps {
  email: string | null;
  className?: string;
  /** Fallback when email is null/empty. Default "—" */
  fallback?: string;
}

export function CopyableEmail({
  email,
  className = "",
  fallback = "—",
}: CopyableEmailProps) {
  const value = email?.trim() || null;
  const display = value ?? fallback;
  const isClickable = !!value;

  async function handleClick() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Email copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }

  if (!isClickable) {
    return (
      <span className={className}>
        {display}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`cursor-pointer rounded text-left underline-offset-2 transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 dark:focus:ring-gray-500 ${className}`}
      title="Click to copy email"
    >
      {display}
    </button>
  );
}

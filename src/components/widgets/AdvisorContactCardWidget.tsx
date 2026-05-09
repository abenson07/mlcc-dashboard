import React from "react";
import Badge from "@/components/ui/badge/Badge";

export function AdvisorContactCardWidget({
  title,
  subtitle,
  initials,
  name,
  email,
  emailHref,
  className = "",
}: {
  title: string;
  subtitle: string;
  initials: string;
  name: string;
  email: string;
  emailHref?: string;
  className?: string;
}) {
  const href = emailHref ?? `mailto:${email}`;

  return (
    <div
      className={`rounded-xl border border-mercury-line bg-white p-5 dark:border-white/10 dark:bg-white/[0.03] ${className}`.trim()}
    >
      <div className="text-mercury-body font-semibold text-mercury-ink dark:text-white/90">
        {title}
      </div>
      <p className="mt-1 text-mercury-caption text-mercury-muted dark:text-white/55">
        {subtitle}
      </p>
      <div className="mt-5 flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-light-50 text-mercury-body font-semibold text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-300">
          {initials}
        </span>
        <div className="min-w-0">
          <div className="text-mercury-small font-semibold text-mercury-ink dark:text-white/90">
            {name}
          </div>
          <a
            href={href}
            className="text-mercury-caption font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            {email}
          </a>
        </div>
      </div>
    </div>
  );
}

export function StatusPillWidget({
  label,
  status,
  statusColor = "success",
}: {
  label: string;
  status: string;
  statusColor?: "success" | "primary" | "warning";
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-mercury-caption font-medium text-brand-600 dark:text-brand-400">
        {label}
      </span>
      <Badge variant="light" color={statusColor} size="sm">
        {status}
      </Badge>
    </div>
  );
}

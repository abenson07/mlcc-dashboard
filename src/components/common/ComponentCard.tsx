import React from "react";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: React.ReactNode;
  action?: React.ReactNode;
  headerLayout?: "default" | "stacked";
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  action,
  headerLayout = "default",
}) => {
  const showDesc =
    desc != null && (typeof desc !== "string" || desc !== "");

  const stackedDesc =
    showDesc &&
    (typeof desc === "string" ? (
      <p className="mt-3 text-mercury-caption text-mercury-muted dark:text-white/50">
        {desc}
      </p>
    ) : (
      <div className="mt-3">{desc}</div>
    ));

  return (
    <div
      className={`rounded-mercury-card bg-mercury-surface p-6 dark:bg-white/[0.04] ${className}`}
    >
      {headerLayout === "stacked" ? (
        <div className="pb-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-mercury-display text-mercury-h3 font-[450] text-mercury-ink dark:text-white/90">
              {title}
            </h3>
            {action ? <div className="flex-shrink-0">{action}</div> : null}
          </div>
          {stackedDesc}
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4 pb-5">
          <div>
            <h3 className="font-mercury-display text-mercury-h3 font-[450] text-mercury-ink dark:text-white/90">
              {title}
            </h3>
            {showDesc &&
              (typeof desc === "string" ? (
                <p className="mt-1 text-mercury-caption text-mercury-muted dark:text-white/50">
                  {desc}
                </p>
              ) : (
                <div className="mt-1">{desc}</div>
              ))}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      <div className="space-y-6 border-t border-mercury-line pt-6 dark:border-white/10">
        {children}
      </div>
    </div>
  );
};

export default ComponentCard;

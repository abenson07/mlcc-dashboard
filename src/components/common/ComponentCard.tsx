import React from "react";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: React.ReactNode; // Description text (string or e.g. CopyableEmail)
  action?: React.ReactNode; // Optional action (e.g. button) on the right side of the header
  /** stacked: title + action on one row, description full width below (default: title+desc left, action right) */
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
    desc != null &&
    (typeof desc !== "string" || desc !== "");

  const stackedDesc = showDesc &&
    (typeof desc === "string" ? (
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
    ) : (
      <div className="mt-3">{desc}</div>
    ));

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      {headerLayout === "stacked" ? (
        <div className="px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {title}
            </h3>
            {action ? <div className="flex-shrink-0">{action}</div> : null}
          </div>
          {stackedDesc}
        </div>
      ) : (
        <div className="px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {title}
            </h3>
            {showDesc &&
              (typeof desc === "string" ? (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {desc}
                </p>
              ) : (
                <div className="mt-1">{desc}</div>
              ))}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      {/* Card Body */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;

import { ChevronRight, Star } from "lucide-react";

export type BreadcrumbSegment = {
  label: string;
  href?: string;
};

type PageBreadcrumbProps = {
  segments: BreadcrumbSegment[];
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
};

export default function PageBreadcrumb({
  segments,
  showFavorite = true,
  isFavorite = false,
  onFavoriteToggle,
}: PageBreadcrumbProps) {
  return (
    <div className="shell-page-breadcrumb">
      <div className="shell-breadcrumbs">
        {segments.map((segment, index) => (
          <span key={segment.label} style={{ display: "contents" }}>
            {index > 0 ? (
              <ChevronRight className="shell-breadcrumb-chevron" size={14} strokeWidth={1.5} />
            ) : null}
            <span className="shell-breadcrumb-segment">{segment.label}</span>
          </span>
        ))}
      </div>
      {showFavorite ? (
        <button
          type="button"
          className="shell-breadcrumb-star-btn"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          onClick={onFavoriteToggle}
        >
          <Star
            className={[
              "shell-breadcrumb-star",
              isFavorite ? "shell-breadcrumb-star--active" : null,
            ]
              .filter(Boolean)
              .join(" ")}
            size={12}
            strokeWidth={1.5}
            fill={isFavorite ? "currentColor" : "none"}
          />
        </button>
      ) : null}
    </div>
  );
}

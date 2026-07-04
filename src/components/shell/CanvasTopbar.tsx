import type { ReactNode } from "react";
import CanvasTooling from "./CanvasTooling";
import PageBreadcrumb, { type BreadcrumbSegment } from "./PageBreadcrumb";

type CanvasTopbarProps = {
  breadcrumbs: BreadcrumbSegment[];
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onToggleWidgetPanel?: () => void;
  widgetPanelOpen?: boolean;
  tooling?: ReactNode;
};

export default function CanvasTopbar({
  breadcrumbs,
  showFavorite = true,
  isFavorite = false,
  onFavoriteToggle,
  onToggleWidgetPanel,
  widgetPanelOpen,
  tooling,
}: CanvasTopbarProps) {
  return (
    <header className="shell-canvas-topbar">
      <PageBreadcrumb
        segments={breadcrumbs}
        showFavorite={showFavorite}
        isFavorite={isFavorite}
        onFavoriteToggle={onFavoriteToggle}
      />
      {tooling ?? (
        <CanvasTooling
          onToggleWidgetPanel={onToggleWidgetPanel}
          widgetPanelOpen={widgetPanelOpen}
        />
      )}
    </header>
  );
}

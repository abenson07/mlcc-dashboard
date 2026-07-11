"use client";

import { Download, PanelRightClose } from "lucide-react";

type CanvasToolingLink = {
  label: string;
  onClick?: () => void;
};

type CanvasToolingProps = {
  onToggleWidgetPanel?: () => void;
  widgetPanelOpen?: boolean;
  links?: CanvasToolingLink[];
  showDownload?: boolean;
};

export default function CanvasTooling({
  onToggleWidgetPanel,
  widgetPanelOpen = true,
  links,
  showDownload = true,
}: CanvasToolingProps) {
  return (
    <div className="shell-canvas-tooling">
      {links?.map((link) => (
        <button
          key={link.label}
          type="button"
          className="shell-canvas-tooling-link"
          onClick={link.onClick}
        >
          {link.label}
        </button>
      ))}
      {showDownload && (
        <button type="button" className="shell-canvas-tooling-btn" aria-label="Download">
          <Download size={16} strokeWidth={1.5} />
        </button>
      )}
      <button
        type="button"
        className="shell-canvas-tooling-btn shell-canvas-tooling-btn--toggle"
        aria-label={widgetPanelOpen ? "Hide widget panel" : "Show widget panel"}
        aria-pressed={widgetPanelOpen}
        onClick={onToggleWidgetPanel}
      >
        <PanelRightClose size={12} strokeWidth={1.5} />
      </button>
    </div>
  );
}

"use client";

import { Download, PanelRightClose } from "lucide-react";

type CanvasToolingProps = {
  onToggleWidgetPanel?: () => void;
  widgetPanelOpen?: boolean;
};

export default function CanvasTooling({
  onToggleWidgetPanel,
  widgetPanelOpen = true,
}: CanvasToolingProps) {
  return (
    <div className="shell-canvas-tooling">
      <button type="button" className="shell-canvas-tooling-btn" aria-label="Download">
        <Download size={16} strokeWidth={1.5} />
      </button>
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

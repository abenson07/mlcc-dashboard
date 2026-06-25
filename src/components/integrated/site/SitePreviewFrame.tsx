"use client";

import { useCallback, useEffect, useRef } from "react";
import { attachCommentMode } from "@/lib/site-feedback/commentMode";
import type { EditableAnchor } from "@/lib/site-feedback/types";

type SitePreviewFrameProps = {
  pagePath: string;
  commentMode: boolean;
  onSelectElement: (anchor: EditableAnchor) => void;
};

export default function SitePreviewFrame({
  pagePath,
  commentMode,
  onSelectElement,
}: SitePreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const detachRef = useRef<(() => void) | null>(null);
  const onSelectRef = useRef(onSelectElement);

  useEffect(() => {
    onSelectRef.current = onSelectElement;
  }, [onSelectElement]);

  const setupCommentMode = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    detachRef.current?.();
    detachRef.current = null;

    if (!commentMode) return;

    try {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;
      if (!doc || !win) return;

      detachRef.current = attachCommentMode(doc, win, (anchor) => {
        onSelectRef.current(anchor);
      });
    } catch {
      // Cross-origin or not yet loaded — ignore until load handler runs again.
    }
  }, [commentMode]);

  useEffect(() => {
    setupCommentMode();
    return () => {
      detachRef.current?.();
      detachRef.current = null;
    };
  }, [setupCommentMode, pagePath]);

  const src = pagePath === "/" ? "/" : pagePath;

  return (
    <iframe
      ref={iframeRef}
      title="Site preview"
      src={src}
      className="lf-site-preview-iframe"
      onLoad={setupCommentMode}
    />
  );
}

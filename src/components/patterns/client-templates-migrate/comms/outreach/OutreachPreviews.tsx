"use client";

import type { ReactNode } from "react";
import { CAPTION_LIMITS } from "@/lib/buffer/imageSpecs";
import type { SocialPlatform, UploadedImage } from "./types";

const ORG_NAME = "Maple Leaf Community Council";
const cardStyle = {
  borderRadius: 12,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  overflow: "hidden",
} as const;

function Avatar() {
  return (
    <div
      aria-hidden
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 600,
        color: "#fff",
        background: "var(--linear-color-accent)",
      }}
    >
      M
    </div>
  );
}

/** Facebook/Instagram-style post card. `menu` renders in the top-right (the ⋯ button). */
export function PlatformPreview({
  platform,
  text,
  image,
  dateLabel,
  menu,
}: {
  platform: SocialPlatform;
  text: string;
  image?: UploadedImage | null;
  dateLabel?: string;
  menu?: ReactNode;
}) {
  const limit = CAPTION_LIMITS[platform];
  const over = text.length > limit;
  const imageEl = image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.url}
      alt="Post image"
      style={{
        display: "block",
        width: "100%",
        aspectRatio: platform === "instagram" ? "1 / 1" : "1.91 / 1",
        objectFit: "cover",
        background: "var(--linear-color-surface-2)",
      }}
    />
  ) : platform === "instagram" ? (
    <div
      style={{
        aspectRatio: "1 / 1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        color: "var(--linear-color-ink-subtle)",
        background: "var(--linear-color-surface-2)",
      }}
    >
      Instagram needs an image
    </div>
  ) : null;

  const caption = (
    <div style={{ padding: "0 14px 12px", fontSize: 14, lineHeight: "21px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {text || <span style={{ color: "var(--linear-color-ink-tertiary)" }}>Your caption appears here.</span>}
    </div>
  );

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 14, position: "relative" }}>
        <Avatar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{ORG_NAME}</div>
          {dateLabel ? <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{dateLabel}</div> : null}
        </div>
        {menu}
      </div>
      {platform === "facebook" ? (
        <>
          {caption}
          {imageEl}
        </>
      ) : (
        <>
          {imageEl}
          <div style={{ height: 12 }} />
          {caption}
        </>
      )}
      <div
        style={{
          padding: "8px 14px",
          fontSize: 11,
          textAlign: "right",
          color: over ? "#e5484d" : "var(--linear-color-ink-tertiary)",
          borderTop: "var(--linear-border-width) solid var(--linear-color-hairline)",
        }}
      >
        {text.length.toLocaleString()} / {limit.toLocaleString()}
      </div>
    </div>
  );
}

function previewHtml(html: string, firstName: string): string {
  return html
    .replace(/\{\{\{\s*contact\.first_name\s*(?:\|[^}]*)?\}\}\}/g, firstName)
    .replace(/\{\{\{\s*RESEND_UNSUBSCRIBE_URL\s*\}\}\}/g, "#");
}

/** Inbox-style email preview. Rendered in a sandboxed iframe so pasted HTML can't run scripts. */
export function InboxPreview({
  subject,
  html,
  toLabel,
  headerImage,
}: {
  subject: string;
  html: string;
  toLabel: string;
  headerImage?: UploadedImage | null;
}) {
  const doc = `<!doctype html><html><body style="margin:0;padding:16px;font:14px/22px -apple-system,system-ui,sans-serif;color:#1f1f1f">${
    headerImage ? `<img src="${headerImage.url}" alt="" style="width:100%;border-radius:6px;margin-bottom:12px">` : ""
  }${previewHtml(html, "Dana")}</body></html>`;
  return (
    <div style={cardStyle}>
      <div style={{ padding: 14, fontSize: 13, lineHeight: "20px", borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)" }}>
        <div style={{ color: "var(--linear-color-ink-subtle)" }}>
          From: {ORG_NAME} · To: {toLabel}
        </div>
        <div style={{ fontWeight: 600, marginTop: 2 }}>Subject: {subject || "(no subject)"}</div>
      </div>
      <iframe
        title="Email preview"
        sandbox=""
        srcDoc={doc}
        style={{ width: "100%", height: 420, border: 0, background: "#fff", display: "block" }}
      />
    </div>
  );
}

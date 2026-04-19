import crypto from "node:crypto";
import { webflowJson } from "@/lib/webflow/client";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

type CreateAssetResponse = {
  id: string;
  uploadUrl?: string;
  uploadDetails?: Record<string, string | number | boolean>;
  hostedUrl?: string;
  assetUrl?: string;
};

/** Allowed Webflow image asset types (see Webflow assets docs). */
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/svg+xml",
  "image/webp",
  "image/avif",
]);

function normalizeMime(mime: string): string {
  const m = mime.split(";")[0]?.trim().toLowerCase() ?? "";
  return m === "image/jpg" ? "image/jpeg" : m;
}

/**
 * Uploads an image to Webflow site assets (create metadata → S3 POST), returns hosted URL for CMS Image fields.
 * Requires token scope `assets:write` and `sites:read`.
 */
export async function uploadSiteImageAsset(
  token: string,
  siteId: string,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ url: string; fileId: string }> {
  const mime = normalizeMime(mimeType);
  if (!ALLOWED_MIME.has(mime)) {
    throw new Error(
      `Unsupported image type (${mimeType || "unknown"}). Use PNG, JPEG, GIF, SVG, WebP, or AVIF.`
    );
  }
  if (fileBuffer.length > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 4MB or smaller.");
  }

  const safeName =
    fileName.replace(/[^\w.\-]+/g, "_").slice(0, 99) || `upload.${mime === "image/svg+xml" ? "svg" : "png"}`;

  const fileHash = crypto.createHash("md5").update(fileBuffer).digest("hex");

  const created = await webflowJson<CreateAssetResponse>(
    token,
    `/sites/${encodeURIComponent(siteId)}/assets`,
    {
      method: "POST",
      body: JSON.stringify({
        fileName: safeName,
        fileHash,
      }),
    }
  );

  const urlEarly = created.hostedUrl ?? created.assetUrl;
  if (urlEarly && !created.uploadUrl) {
    return { url: urlEarly, fileId: created.id };
  }

  if (!created.uploadUrl || !created.uploadDetails) {
    throw new Error("Webflow did not return upload instructions for this asset.");
  }

  const fd = new FormData();
  for (const [k, v] of Object.entries(created.uploadDetails)) {
    if (v == null || v === "") continue;
    fd.append(k, String(v));
  }
  const blob = new Blob([new Uint8Array(fileBuffer)], { type: mime });
  fd.append("file", blob, safeName);

  const up = await fetch(created.uploadUrl, { method: "POST", body: fd });
  if (!up.ok) {
    const t = await up.text();
    throw new Error(
      `Storage upload failed (${up.status}). ${t.slice(0, 200)}`
    );
  }

  const url = created.hostedUrl ?? created.assetUrl;
  if (!url) {
    throw new Error("Webflow did not return a hosted URL for the new asset.");
  }
  return { url, fileId: created.id };
}

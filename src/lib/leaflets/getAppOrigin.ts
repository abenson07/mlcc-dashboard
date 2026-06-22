import type { NextRequest } from "next/server";

/** Absolute origin for signed public links (no trailing slash). */
export function getAppOrigin(request?: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (request) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    if (host) return `${proto}://${host}`;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;

  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();
  return `http://localhost:3000${basePath}`;
}

import { NextRequest, NextResponse } from "next/server";

function parseLandingOrigins(): string[] {
  const raw = process.env.MLCC_LANDING_ORIGINS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export function isAllowedLandingOrigin(origin: string | null): boolean {
  if (!origin) return false;
  const normalized = origin.replace(/\/$/, "");
  const allowed = parseLandingOrigins();
  if (allowed.length === 0) return false;
  return allowed.some((a) => a === normalized);
}

export function corsPreflightResponse(request: NextRequest): NextResponse {
  const origin = request.headers.get("origin");
  const headers = new Headers();
  if (origin && isAllowedLandingOrigin(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    headers.set("Access-Control-Max-Age", "86400");
  }
  return new NextResponse(null, { status: 204, headers });
}

export function withCors(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const origin = request.headers.get("origin");
  if (origin && isAllowedLandingOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }
  return response;
}

export function validateReturnOrigin(origin: string | undefined): string | null {
  if (!origin?.trim()) return null;
  const normalized = origin.trim().replace(/\/$/, "");
  return isAllowedLandingOrigin(normalized) ? normalized : null;
}

import { NextRequest, NextResponse } from "next/server";
import { corsPreflightResponse, withCors } from "@/lib/stripe/cors";
import { getPublicOpenRoutes } from "@/lib/leaflets/getPublicOpenRoutes";

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPublicOpenRoutes();
    return withCors(request, NextResponse.json(payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load open routes";
    return withCors(request, NextResponse.json({ error: message }, { status: 500 }));
  }
}

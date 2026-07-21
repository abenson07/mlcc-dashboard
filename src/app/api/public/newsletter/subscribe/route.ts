import { NextRequest, NextResponse } from "next/server";
import { corsPreflightResponse, withCors } from "@/lib/stripe/cors";
import { upsertNewsletterContact } from "@/lib/resendContacts";

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withCors(request, NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }));
  }

  const { email, firstName } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || !email.trim()) {
    return withCors(request, NextResponse.json({ error: "Email is required" }, { status: 400 }));
  }

  await upsertNewsletterContact(
    email.trim(),
    typeof firstName === "string" && firstName.trim() ? firstName.trim() : undefined,
  );

  return withCors(request, NextResponse.json({ ok: true }));
}

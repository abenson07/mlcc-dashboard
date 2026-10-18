import { NextRequest, NextResponse } from "next/server";
import { signEditToken } from "@/lib/website/editToken";
import { requireAdminUser, unauthorized } from "@/lib/website/guard";

export const runtime = "nodejs";

/** Mints the token the public site needs to render in edit mode inside this admin. */
export async function POST(request: NextRequest) {
  if (!(await requireAdminUser())) return unauthorized();
  const siteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, "");
  if (!siteUrl) return NextResponse.json({ error: "NEXT_PUBLIC_WEBSITE_URL is not set" }, { status: 503 });
  try {
    const token = signEditToken({ parent: request.nextUrl.origin });
    return NextResponse.json({ token, siteUrl });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not start editing" }, { status: 503 });
  }
}

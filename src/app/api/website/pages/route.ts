import { NextResponse } from "next/server";
import { requireAdminUser, unauthorized } from "@/lib/website/guard";
import { listEvents } from "@/lib/website/sanityServer";

export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdminUser())) return unauthorized();
  try {
    return NextResponse.json({ events: await listEvents() });
  } catch (e) {
    console.error("[website/pages]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not load pages" }, { status: 502 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { normalizeDocId } from "@/lib/website/fields";
import { requireAdminUser, unauthorized } from "@/lib/website/guard";
import { loadDoc } from "@/lib/website/sanityServer";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await requireAdminUser())) return unauthorized();
  const id = normalizeDocId(request.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    const loaded = await loadDoc(id);
    if (!loaded) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(loaded);
  } catch (e) {
    console.error("[website/doc]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not load" }, { status: 502 });
  }
}

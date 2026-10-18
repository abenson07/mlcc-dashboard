import { NextRequest, NextResponse } from "next/server";
import { normalizeDocId } from "@/lib/website/fields";
import { logWebsiteEdit, requireAdminUser, unauthorized } from "@/lib/website/guard";
import { discardDraft, loadDoc, publishDoc } from "@/lib/website/sanityServer";

export const runtime = "nodejs";

/** Publish makes the draft live; discard throws the draft away and keeps what's live. */
export async function POST(request: NextRequest) {
  const user = await requireAdminUser();
  if (!user) return unauthorized();

  let body: { id?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = normalizeDocId(body.id);
  const action = body.action === "publish" || body.action === "discard" ? body.action : null;
  if (!id || !action) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const loaded = await loadDoc(id);
    if (!loaded) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const done = action === "publish" ? await publishDoc(id) : await discardDraft(id);
    if (!done) return NextResponse.json({ error: "There are no unpublished changes" }, { status: 409 });
    await logWebsiteEdit({ user, docId: id, docType: loaded.type, action });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[website/publish]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 502 });
  }
}

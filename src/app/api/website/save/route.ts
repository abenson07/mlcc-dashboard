import { NextRequest, NextResponse } from "next/server";
import { normalizeDocId, validateChanges } from "@/lib/website/fields";
import { logWebsiteEdit, requireAdminUser, unauthorized } from "@/lib/website/guard";
import { loadDoc, saveChanges } from "@/lib/website/sanityServer";

export const runtime = "nodejs";

/** Saves edits to the document's draft. Nothing goes live until it's published. */
export async function POST(request: NextRequest) {
  const user = await requireAdminUser();
  if (!user) return unauthorized();

  let body: { id?: unknown; changes?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = normalizeDocId(body.id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    // The type comes from Sanity, never from the client.
    const loaded = await loadDoc(id);
    if (!loaded) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const result = validateChanges(loaded.type, body.changes);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 422 });

    await saveChanges(id, result.changes);
    await logWebsiteEdit({
      user,
      docId: id,
      docType: loaded.type,
      action: "save",
      fields: [...Object.keys(result.changes.set), ...result.changes.unset],
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[website/save]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Save failed" }, { status: 502 });
  }
}

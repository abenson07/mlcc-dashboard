import { NextResponse } from "next/server";
import { requireBufferApiUser, bufferErrorResponse } from "@/lib/buffer/auth";
import { deleteSocialPost } from "@/lib/buffer/mutations";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ postId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireBufferApiUser();
  if (auth.error) return auth.error;

  const { postId } = await context.params;
  const id = postId?.trim();
  if (!id) {
    return NextResponse.json({ error: "postId is required." }, { status: 400 });
  }

  try {
    await deleteSocialPost(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return bufferErrorResponse(e);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { logWebsiteEdit, requireAdminUser, unauthorized } from "@/lib/website/guard";
import { uploadImage } from "@/lib/website/sanityServer";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

export async function POST(request: NextRequest) {
  const user = await requireAdminUser();
  if (!user) return unauthorized();

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP, GIF or AVIF image" }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image is over 12 MB" }, { status: 413 });

  try {
    const image = await uploadImage(Buffer.from(await file.arrayBuffer()), file.name, file.type);
    await logWebsiteEdit({ user, docId: image.asset._ref, action: "upload" });
    return NextResponse.json({ image });
  } catch (e) {
    console.error("[website/upload]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 502 });
  }
}

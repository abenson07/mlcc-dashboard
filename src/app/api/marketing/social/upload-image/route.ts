import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { validateImageDimensions } from "@/lib/buffer/imageSpecs";
import type { SupportedSocialService } from "@/lib/buffer/types";

export const runtime = "nodejs";

const BUCKET = "social-images";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function positiveInt(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n <= 20000 ? n : null;
}

/**
 * Stores an image publicly so Buffer/Resend can fetch it.
 * The browser reads width/height (it already decodes the image for the preview)
 * and sends them; we echo them back with per-platform fit hints.
 */
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required." }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Image must be JPEG, PNG, or WebP." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 8MB or smaller." }, { status: 400 });
  }
  const width = positiveInt(form.get("width"));
  const height = positiveInt(form.get("height"));
  if (!width || !height) {
    return NextResponse.json({ error: "width and height are required." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin Supabase client is not configured." }, { status: 500 });
  }

  const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: false,
    });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);

  const fit = {} as Record<SupportedSocialService, { ok: boolean; message: string }>;
  for (const service of ["instagram", "facebook"] as const) {
    const result = validateImageDimensions(service, width, height);
    fit[service] = { ok: result.ok, message: result.message };
  }

  return NextResponse.json({ url: data.publicUrl, width, height, fit });
}

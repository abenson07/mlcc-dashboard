import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const supabase = await getSupabaseForLeafletRoutes();

  const { data: meeting, error: fetchError } = await supabase
    .from("committee_meetings")
    .select("id, minutes_status, raw_transcript")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }
  if (meeting.minutes_status !== "draft" && meeting.minutes_status !== "error") {
    return NextResponse.json(
      { error: "Files can only be uploaded while minutes are draft" },
      { status: 400 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be 25MB or smaller" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${id}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin Supabase client is not configured" }, { status: 500 });
  }
  const { error: uploadError } = await admin.storage
    .from("meeting-files")
    .upload(path, buffer, { contentType: file.type || "application/octet-stream", upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = admin.storage.from("meeting-files").getPublicUrl(path);
  const attachmentUrl = publicUrlData.publicUrl;

  const patch: Record<string, unknown> = {
    minutes_attachment_url: attachmentUrl,
    minutes_source: "file",
    updated_at: new Date().toISOString(),
  };

  // For plain text uploads, seed raw_transcript so AI compose can run.
  if (ext === "txt" || ext === "md" || file.type.startsWith("text/")) {
    const text = buffer.toString("utf8").trim();
    if (text) {
      patch.raw_transcript = text;
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("committee_meetings")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    meeting: updated,
    minutes_attachment_url: attachmentUrl,
  });
}

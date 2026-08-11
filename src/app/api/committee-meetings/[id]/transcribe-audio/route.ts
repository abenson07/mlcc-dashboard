import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/webm",
  "audio/ogg",
  "video/webm",
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });
  }

  const supabase = await getSupabaseForLeafletRoutes();
  const { data: meeting, error: fetchError } = await supabase
    .from("committee_meetings")
    .select("id, minutes_status")
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
      { error: "Transcript can only be updated while minutes are draft" },
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
    return NextResponse.json({ error: "Audio file must be 25MB or smaller" }, { status: 400 });
  }
  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported audio type: ${file.type}` },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop() || "m4a";
  const path = `${id}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin Supabase client is not configured" }, { status: 500 });
  }
  const { error: uploadError } = await admin.storage
    .from("meeting-files")
    .upload(path, buffer, { contentType: file.type || "audio/mpeg", upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = admin.storage.from("meeting-files").getPublicUrl(path);
  const audioUrl = publicUrlData.publicUrl;

  const whisperForm = new FormData();
  whisperForm.append("file", new Blob([new Uint8Array(buffer)], { type: file.type || "audio/mpeg" }), file.name);
  whisperForm.append("model", "whisper-1");

  const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: whisperForm,
  });

  if (!whisperRes.ok) {
    const errText = await whisperRes.text();
    return NextResponse.json(
      { error: `Transcription failed: ${errText.slice(0, 400)}` },
      { status: 502 },
    );
  }

  const whisperJson = (await whisperRes.json()) as { text?: string };
  const transcript = (whisperJson.text ?? "").trim();
  if (!transcript) {
    return NextResponse.json({ error: "Transcription returned empty text" }, { status: 502 });
  }

  const { data: updated, error: updateError } = await supabase
    .from("committee_meetings")
    .update({
      raw_transcript: transcript,
      audio_url: audioUrl,
      minutes_source: "audio",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    meeting: updated,
    transcript,
    audio_url: audioUrl,
  });
}

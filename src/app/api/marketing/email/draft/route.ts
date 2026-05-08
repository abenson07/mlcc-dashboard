import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { composeMarketingEmail } from "@/lib/marketing/composeEmail";
import { getVoiceToneMarkdown } from "@/lib/marketing/voiceTone";

export const runtime = "nodejs";

const MAX_PROMPT = 8000;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { prompt?: unknown; scheduledAt?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const prompt =
      typeof body.prompt === "string" ? body.prompt.trim().slice(0, MAX_PROMPT) : "";
    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required (non-empty string)." },
        { status: 400 }
      );
    }

    const scheduledAtRaw = body.scheduledAt;
    let scheduledAtDescription = "not specified";
    if (typeof scheduledAtRaw === "string" && scheduledAtRaw.trim()) {
      scheduledAtDescription = scheduledAtRaw.trim();
    }

    const voiceToneMarkdown = getVoiceToneMarkdown();
    const { subject, html } = await composeMarketingEmail({
      userPrompt: prompt,
      scheduledAtDescription,
      voiceToneMarkdown,
    });

    return NextResponse.json({ subject, html });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Draft failed.";
    console.error("[marketing/email/draft]", e);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

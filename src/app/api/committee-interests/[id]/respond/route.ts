import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { createClient } from "@/lib/supabase/server";
import { looksLikeEmail } from "@/lib/committees/looksLikeEmail";
import { sendCommitteeInterestEmail } from "@/lib/committees/sendCommitteeEmail";

type RouteContext = { params: Promise<{ id: string }> };

/** Email-first response: send via Resend (hello@) and mark interest handled. */
export async function POST(request: NextRequest, ctx: RouteContext) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing interest id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const subject = typeof b.subject === "string" ? b.subject.trim() : "";
  const text = typeof b.text === "string" ? b.text.trim() : "";
  const html = typeof b.html === "string" ? b.html.trim() : "";

  if (!subject || !text) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: interest, error: fetchError } = await supabase
    .from("committee_interests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!interest) {
    return NextResponse.json({ error: "Interest not found" }, { status: 404 });
  }

  const to = (interest.contact as string) ?? "";
  if (!looksLikeEmail(to)) {
    return NextResponse.json(
      { error: "Contact is not an email address — use mark-handled instead." },
      { status: 400 },
    );
  }

  const emailResult = await sendCommitteeInterestEmail({
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });

  if (!emailResult.sent) {
    return NextResponse.json(
      { error: emailResult.error ?? "Failed to send email" },
      { status: 502 },
    );
  }

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("committee_interests")
    .update({
      status: "handled",
      responded_at: now,
      responded_by: session.user.id,
      response_email_id: emailResult.id ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // If linked to a pending volunteer signup, accept it.
  if (interest.volunteer_ask_id) {
    const { data: people } = await supabase
      .from("people")
      .select("id")
      .ilike("email", to)
      .maybeSingle();
    if (people?.id) {
      await supabase
        .from("volunteers")
        .update({
          status: "accepted",
          accepted_at: now,
          accepted_by: session.user.id,
        })
        .eq("volunteer_ask_id", interest.volunteer_ask_id)
        .eq("person_id", people.id)
        .eq("status", "pending");
    }
  }

  return NextResponse.json({ ok: true, interest: updated, emailId: emailResult.id });
}

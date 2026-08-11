import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { sendCommitteeInterestEmail } from "@/lib/committees/sendCommitteeEmail";

/**
 * Demo-mode-safe email send: recipient is always the authenticated caller,
 * resolved server-side from the session — never from the request body — so
 * a client can't use this to spoof mail to a real contact.
 */
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const to = session.user.email;
  if (!to) {
    return NextResponse.json({ error: "No email on the authenticated account" }, { status: 400 });
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
  const context = typeof b.context === "string" ? b.context.trim() : "";

  if (!subject || !text) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const contextLine = context ? `\n\n— In production this would have gone to: ${context}` : "";

  const result = await sendCommitteeInterestEmail({
    to,
    subject: `[DEMO] ${subject}`,
    text: `${text}${contextLine}`,
    ...(html ? { html: `${html}${context ? `<p><em>In production this would have gone to: ${context}</em></p>` : ""}` } : {}),
  });

  if (!result.sent) {
    return NextResponse.json({ error: result.error ?? "Failed to send demo email" }, { status: 502 });
  }
  return NextResponse.json({ sent: true, id: result.id });
}

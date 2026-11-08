import { NextRequest, NextResponse } from "next/server";
import { corsPreflightResponse, withCors } from "@/lib/stripe/cors";
import { postContactToSlack } from "@/lib/slack";

// Real people take a few seconds to type; bots post instantly or skip the form entirely.
const MIN_FILL_MS = 3000;

// Bot spam here is usually a single random token like "GAkTBvJqkjviHlXjntVN":
// no spaces, letters only, mixed case. Real messages almost never look like that.
function looksLikeGibberish(text: string): boolean {
  const t = text.trim();
  if (/\s/.test(t) || t.length < 12) return false;
  if (!/^[A-Za-z]+$/.test(t)) return false;
  return /[a-z]/.test(t) && (t.slice(1).match(/[A-Z]/g) ?? []).length >= 3;
}

export async function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withCors(request, NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }));
  }

  const { email, message, website, startedAt } = (body ?? {}) as Record<string, unknown>;
  const ok = () => withCors(request, NextResponse.json({ ok: true }));

  // Honeypot: a hidden field only bots fill in. Pretend success so they don't adapt.
  if (typeof website === "string" && website.trim()) return ok();

  // Time trap: the form stamps when it was rendered. Missing (direct API post) or too fast = bot.
  const started = typeof startedAt === "number" ? startedAt : Number.NaN;
  if (!Number.isFinite(started) || Date.now() - started < MIN_FILL_MS) return ok();

  if (typeof email !== "string" || !email.trim() || typeof message !== "string" || !message.trim()) {
    return withCors(
      request,
      NextResponse.json({ error: "Email and message are required" }, { status: 400 }),
    );
  }

  if (looksLikeGibberish(message)) return ok();

  const text =
    `:incoming_envelope: New contact form message\n` +
    `*From:* ${email.trim()}\n` +
    `*Message:* ${message.trim()}`;

  await postContactToSlack(text);

  return withCors(request, NextResponse.json({ ok: true }));
}

import Anthropic from "@anthropic-ai/sdk";
import { CAPTION_LIMITS } from "@/lib/buffer/imageSpecs";
import {
  assertWithinLimits,
  eventFactsLines,
  type SocialEventFacts,
} from "@/lib/marketing/composeSocialCopy";
import type { PlanTouch } from "@/lib/marketing/planSchedule";
import { sanitizeEmailHtml } from "@/lib/marketing/sanitizeEmailHtml";

const MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6";
export const UNSUBSCRIBE_TAG = "{{{RESEND_UNSUBSCRIBE_URL}}}";

export type ComposedTouch = {
  id: string;
  /** Social caption (facebook/instagram touches). */
  text?: string;
  /** Email touches. */
  subject?: string;
  html?: string;
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Sanitizes and guarantees the Resend unsubscribe footer is present. */
export function finalizeEmailHtml(html: string): string {
  const clean = sanitizeEmailHtml(html);
  if (clean.includes(UNSUBSCRIBE_TAG)) return clean;
  return `${clean}\n<p><a href="${UNSUBSCRIBE_TAG}">Unsubscribe</a></p>`;
}

function textToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

/** "Use as written": the same text on every touch, nothing rewritten. */
export function composePlanVerbatim(
  context: string,
  touches: PlanTouch[],
  eventName: string,
): ComposedTouch[] {
  const text = context.trim();
  const out = touches.map((t): ComposedTouch =>
    t.channel === "email"
      ? { id: t.id, subject: eventName, html: finalizeEmailHtml(textToHtml(text)) }
      : { id: t.id, text },
  );
  for (const t of touches) {
    if (t.channel !== "email") assertWithinLimits({ [t.channel]: text });
  }
  return out;
}

function extractJsonObject(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence?.[1]?.trim() ?? text.trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain a JSON object.");
  }
  return candidate.slice(start, end + 1);
}

export async function composePlanCopy(input: {
  context: string;
  event: SocialEventFacts;
  touches: PlanTouch[];
  voiceToneMarkdown: string;
}): Promise<ComposedTouch[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const client = new Anthropic({ apiKey });

  const system = `You write an outreach campaign for an upcoming event for a neighborhood community organization.

You get a list of touches (date, channel, kind). Write one piece per touch, strictly following the voice_and_tone guide, and vary the angle across the campaign (announce, remind, urgency near the date) so it does not read as copy-paste.

Output a single JSON object only: {"touches":[{"id": "...", ...}]} with one entry per input touch, using the same id.
- facebook / instagram touches: {"id","text"}. Instagram under 600 characters (hard limit ${CAPTION_LIMITS.instagram}), no pasted URLs ('link in bio'). Facebook under 1,000 characters (hard limit ${CAPTION_LIMITS.facebook}), include the event URL when provided.
- email touches: {"id","subject","html"}. Subject under 120 characters. html uses only p, br, a, strong, em, ul, ol, li, h2, h3; https links only; include {{{contact.first_name|there}}} once in the greeting; end with <p><a href="${UNSUBSCRIBE_TAG}">Unsubscribe</a></p> exactly.
- Use only the facts provided. Never invent dates, times, prices, or links.`;

  const user = `voice_and_tone_guide (markdown):\n---\n${input.voiceToneMarkdown}\n---\n\nEvent facts (authoritative):\n${eventFactsLines(input.event).join("\n")}\n\nStaff notes:\n${input.context}\n\nTouches:\n${JSON.stringify(
    input.touches.map(({ id, date, channel, kind, daysBefore }) => ({ id, date, channel, kind, daysBefore })),
  )}`;

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system,
    messages: [{ role: "user", content: user }],
  });
  const block = msg.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("No text response from model.");

  const parsed = JSON.parse(extractJsonObject(block.text)) as { touches?: unknown };
  const rows = Array.isArray(parsed.touches) ? parsed.touches : [];
  const byId = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    if (row && typeof row === "object" && typeof (row as { id?: unknown }).id === "string") {
      byId.set((row as { id: string }).id, row as Record<string, unknown>);
    }
  }

  return input.touches.map((touch): ComposedTouch => {
    const row = byId.get(touch.id);
    if (!row) throw new Error(`Model did not return copy for ${touch.id}.`);
    if (touch.channel === "email") {
      const subject = typeof row.subject === "string" ? row.subject.trim() : "";
      const html = typeof row.html === "string" ? row.html : "";
      if (!subject || !html) throw new Error(`Email copy for ${touch.id} is incomplete.`);
      return { id: touch.id, subject: subject.slice(0, 200), html: finalizeEmailHtml(html) };
    }
    const text = typeof row.text === "string" ? row.text.trim() : "";
    if (!text) throw new Error(`Social copy for ${touch.id} is empty.`);
    assertWithinLimits({ [touch.channel]: text });
    return { id: touch.id, text };
  });
}

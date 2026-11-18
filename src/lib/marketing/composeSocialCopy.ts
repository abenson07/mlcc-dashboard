import Anthropic from "@anthropic-ai/sdk";
import { CAPTION_LIMITS } from "@/lib/buffer/imageSpecs";
import type { SupportedSocialService } from "@/lib/buffer/types";

const MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6";

export type SocialEventFacts = {
  name: string;
  startsAt?: string;
  locationLabel?: string;
  /** Public event page. Always included verbatim when present — never invented. */
  url?: string | null;
};

export type ComposeSocialInput = {
  /** Staff notes, or the exact post when `verbatim`. */
  context: string;
  verbatim: boolean;
  platforms: SupportedSocialService[];
  event?: SocialEventFacts;
  voiceToneMarkdown: string;
};

export type SocialCaptions = Partial<Record<SupportedSocialService, string>>;

export class CaptionTooLongError extends Error {
  constructor(
    public platform: SupportedSocialService,
    public length: number,
    public limit: number,
  ) {
    super(`The ${platform} caption is ${length} characters; the limit is ${limit}. Shorten it and try again.`);
  }
}

const PLATFORM_GUIDANCE: Record<SupportedSocialService, string> = {
  instagram:
    "Instagram: shorter and punchier (aim for under 600 characters, hard limit 2,200). Link URLs are not clickable, so say 'link in bio' instead of pasting the URL. A few relevant hashtags at the end are fine. Emoji sparingly.",
  facebook:
    "Facebook: a little more detail is fine (aim for under 1,000 characters). Include the event URL as a plain link when one is provided.",
};

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

export function eventFactsLines(event: SocialEventFacts): string[] {
  return [
    `Event name: ${event.name}`,
    event.startsAt ? `Starts: ${event.startsAt}` : null,
    event.locationLabel ? `Location: ${event.locationLabel}` : null,
    event.url ? `Event page URL (use exactly as given): ${event.url}` : null,
  ].filter((l): l is string => Boolean(l));
}

/** Throws `CaptionTooLongError` for the first caption over its platform limit. */
export function assertWithinLimits(captions: SocialCaptions): void {
  for (const [platform, text] of Object.entries(captions) as [SupportedSocialService, string][]) {
    const limit = CAPTION_LIMITS[platform];
    if (text.length > limit) throw new CaptionTooLongError(platform, text.length, limit);
  }
}

/** "Post exactly as written": same text everywhere, validated, never trimmed or rewritten. */
export function composeVerbatim(
  context: string,
  platforms: SupportedSocialService[],
): SocialCaptions {
  const text = context.trim();
  const captions: SocialCaptions = {};
  for (const p of platforms) captions[p] = text;
  assertWithinLimits(captions);
  return captions;
}

async function askModel(
  client: Anthropic,
  system: string,
  user: string,
): Promise<SocialCaptions> {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: user }],
  });
  const block = msg.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("No text response from model.");
  const parsed = JSON.parse(extractJsonObject(block.text)) as Record<string, unknown>;
  const out: SocialCaptions = {};
  for (const key of ["instagram", "facebook"] as const) {
    const v = parsed[key];
    if (typeof v === "string" && v.trim()) out[key] = v.trim();
  }
  return out;
}

export async function composeSocialCopy(input: ComposeSocialInput): Promise<SocialCaptions> {
  if (input.verbatim) return composeVerbatim(input.context, input.platforms);

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const client = new Anthropic({ apiKey });

  const system = `You write social media posts for a neighborhood community organization.

Rewrite the staff member's notes (or draft from them) so each post strictly follows the voice_and_tone guide.
Output a single JSON object only (no prose). Keys are lowercase platform names: ${input.platforms
    .map((p) => `"${p}"`)
    .join(", ")}. Each value is the finished post text.

Per-platform rules:
${input.platforms.map((p) => `- ${PLATFORM_GUIDANCE[p]}`).join("\n")}

Rules:
- Use only facts from the notes and event facts. Do not invent dates, times, prices, or links.
- If an event page URL is given, use it exactly as provided.
- Plain text only, no markdown.`;

  const eventBlock = input.event
    ? `\n\nEvent facts (authoritative):\n${eventFactsLines(input.event).join("\n")}`
    : "";
  const user = `voice_and_tone_guide (markdown):\n---\n${input.voiceToneMarkdown}\n---\n\nStaff notes:\n${input.context}${eventBlock}`;

  let captions = await askModel(client, system, user);
  const missing = input.platforms.filter((p) => !captions[p]);
  if (missing.length > 0) throw new Error(`Model did not return copy for: ${missing.join(", ")}.`);

  try {
    assertWithinLimits(captions);
  } catch (e) {
    if (!(e instanceof CaptionTooLongError)) throw e;
    captions = await askModel(
      client,
      system,
      `${user}\n\nYour previous draft was too long: ${e.message} Rewrite all posts shorter.`,
    );
    assertWithinLimits(captions);
  }
  return captions;
}

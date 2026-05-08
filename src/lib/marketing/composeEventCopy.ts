import Anthropic from "@anthropic-ai/sdk";

const MODEL =
  process.env.ANTHROPIC_MODEL?.trim() || "claude-3-5-sonnet-latest";

export type ComposedEventCopy = {
  shortDescription: string;
  body: string;
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

export type ComposeEventCopyInput = {
  eventName: string;
  startsAt: string;
  endsAt?: string;
  locationLabel?: string;
  committeeName?: string;
  isExternal: boolean;
  externalEventUrl?: string;
  externalOrgName?: string;
  externalOrgUrl?: string;
  voiceToneMarkdown: string;
};

export async function composeEventMarketingCopy(
  input: ComposeEventCopyInput
): Promise<ComposedEventCopy> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const client = new Anthropic({ apiKey });

  const system = `You are an expert writer for a neighborhood community organization promoting upcoming events.

Output a single JSON object only (no prose before or after) with keys:
- "short_description" (string): a concise teaser, 1–3 sentences, suitable for cards and listings. Under ~320 characters if possible.
- "body" (string): a longer, engaging description (several short paragraphs) suitable for an event detail page. Use plain paragraphs separated by blank lines (no HTML). Warm, specific, and actionable.

Both must strictly follow the voice_and_tone guide provided in the user message.`;

  const lines = [
    `Event name: ${input.eventName}`,
    `Starts: ${input.startsAt}`,
    input.endsAt ? `Ends: ${input.endsAt}` : null,
    input.locationLabel ? `Location: ${input.locationLabel}` : null,
    input.committeeName ? `Host committee: ${input.committeeName}` : null,
    `External / third-party event: ${input.isExternal ? "yes" : "no"}`,
    input.externalOrgName ? `Organizer name: ${input.externalOrgName}` : null,
    input.externalEventUrl ? `Event info URL: ${input.externalEventUrl}` : null,
    input.externalOrgUrl ? `Organizer URL: ${input.externalOrgUrl}` : null,
  ].filter(Boolean);

  const userContent = `voice_and_tone_guide (markdown):\n---\n${input.voiceToneMarkdown}\n---

Event facts:
${lines.join("\n")}`;

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system,
    messages: [{ role: "user", content: userContent }],
  });

  const block = msg.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("No text response from model.");
  }

  const jsonStr = extractJsonObject(block.text);
  const parsed = JSON.parse(jsonStr) as {
    short_description?: unknown;
    body?: unknown;
  };
  const shortDescription =
    typeof parsed.short_description === "string"
      ? parsed.short_description.trim()
      : "";
  const body = typeof parsed.body === "string" ? parsed.body.trim() : "";
  if (!shortDescription || !body) {
    throw new Error(
      'Model JSON must include non-empty "short_description" and "body".'
    );
  }
  return { shortDescription, body };
}

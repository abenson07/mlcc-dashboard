import Anthropic from "@anthropic-ai/sdk";

const MODEL =
  process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6";

export type ComposedEventCopy = {
  shortDescription: string;
  body: string;
};

function extractAnthropicJsonObject(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence?.[1]?.trim() ?? text.trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain a JSON object.");
  }
  return candidate.slice(start, end + 1);
}

function extractJsonObject(text: string): string {
  return extractAnthropicJsonObject(text);
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
- "short_description" (string): a **very short** teaser for cards and Webflow listings — target about **72 characters** (stay roughly **65–78**). One crisp phrase, plain text, neighborly. Not a mini-paragraph.
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

export type EventBriefDraftInput = {
  userBrief: string;
  startsAt: string;
  endsAt?: string;
  locationLabel: string | undefined;
  voiceToneMarkdown: string;
};

export type EventBriefDraft = {
  eventName: string;
  shortDescription: string;
  body: string;
  isExternal: boolean;
  externalEventUrl: string;
  externalOrgName: string;
  externalOrgUrl: string;
};

/**
 * From a short organizer brief + schedule/location facts, produce a title,
 * listing teaser, detail body, and optional external-event flags for Webflow.
 */
export async function composeEventDraftFromBrief(
  input: EventBriefDraftInput
): Promise<EventBriefDraft> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const client = new Anthropic({ apiKey });

  const system = `You are an expert writer and editor for Maple Leaf Community Council (MLCC), a Seattle neighborhood nonprofit.

The user will give a rough brief about an upcoming event plus confirmed schedule and location facts. Your job is to produce polished, public-facing Webflow CMS content.

Output a single JSON object only (no prose before or after) with these keys:
- "event_name" (string): clear, inviting public title; sentence case unless a proper name needs capitals. Not clickbait.
- "short_description" (string): **very short** teaser for cards and listings — target about **72 characters** (roughly **65–78**). One crisp phrase, plain text, neighborly.
- "body" (string): longer description for the event detail page — several short paragraphs, plain text only, paragraphs separated by blank lines (no HTML, no markdown headings). Warm, specific, actionable.
- "is_external" (boolean): true only if the brief clearly indicates this is hosted or presented primarily by another organization (MLCC is sharing or co-promoting, not solely hosting). Otherwise false.
- "external_event_url" (string or null): URL to the organizer's event page or RSVP if clearly implied; otherwise null. Never invent or guess URLs.
- "external_org_name" (string or null): third-party organizer name if is_external; otherwise null.
- "external_org_url" (string or null): organizer's website if clearly implied; otherwise null. Never invent URLs.

Strictly follow the voice_and_tone guide in the user message. Use only factual details from the brief and the provided schedule/location lines; do not invent sponsors, prices, or logistics not mentioned. If something is unknown, omit it rather than guessing.`;

  const scheduleLines = [
    `Starts: ${input.startsAt}`,
    input.endsAt ? `Ends: ${input.endsAt}` : null,
    input.locationLabel ? `Location: ${input.locationLabel}` : null,
  ].filter(Boolean);

  const userContent = `voice_and_tone_guide (markdown):\n---\n${input.voiceToneMarkdown}\n---

Organizer brief (rough notes — expand and polish, stay truthful):
${input.userBrief.trim()}

Confirmed schedule / place (use as facts; do not contradict):
${scheduleLines.join("\n")}`;

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
    event_name?: unknown;
    short_description?: unknown;
    body?: unknown;
    is_external?: unknown;
    external_event_url?: unknown;
    external_org_name?: unknown;
    external_org_url?: unknown;
  };

  const eventName =
    typeof parsed.event_name === "string" ? parsed.event_name.trim() : "";
  const shortDescription =
    typeof parsed.short_description === "string"
      ? parsed.short_description.trim()
      : "";
  const body = typeof parsed.body === "string" ? parsed.body.trim() : "";
  if (!eventName || !shortDescription || !body) {
    throw new Error(
      'Model JSON must include non-empty "event_name", "short_description", and "body".'
    );
  }

  const isExternal = parsed.is_external === true;

  const readOptString = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    if (typeof v !== "string") return "";
    return v.trim();
  };

  return {
    eventName: eventName.slice(0, 200),
    shortDescription: shortDescription.slice(0, 2000),
    body: body.slice(0, 20000),
    isExternal,
    externalEventUrl: readOptString(parsed.external_event_url).slice(0, 2000),
    externalOrgName: readOptString(parsed.external_org_name).slice(0, 500),
    externalOrgUrl: readOptString(parsed.external_org_url).slice(0, 2000),
  };
}

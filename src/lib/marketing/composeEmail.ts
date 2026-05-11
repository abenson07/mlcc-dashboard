import Anthropic from "@anthropic-ai/sdk";

const MODEL =
  process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6";

export type ComposedEmail = { subject: string; html: string };

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

export async function composeMarketingEmail(input: {
  userPrompt: string;
  scheduledAtDescription: string;
  voiceToneMarkdown: string;
}): Promise<ComposedEmail> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const client = new Anthropic({ apiKey });

  const system = `You are an expert email marketer for a neighborhood community organization.

You will do two steps in one reply:
1) Draft a promotional/marketing email HTML body from the user's brief.
2) Revise that draft to strictly match the voice_and_tone guide (same meaning, improved tone and clarity).

Output requirements:
- Respond with a single JSON object only (no prose before or after). Keys: "subject" (string) and "html" (string).
- "html" must be email-safe: use only these tags where needed: p, br, a, strong, em, ul, ol, li, h1, h2, h3, img.
- All link hrefs must be https URLs or mailto: . For img src use https only; if you have no image URL, omit images.
- Include the merge tag {{{contact.first_name|there}}} once in the greeting if it fits naturally.
- End the body with a footer paragraph that includes an unsubscribe link using exactly this merge tag (do not replace it): {{{RESEND_UNSUBSCRIBE_URL}}}
  Example: <p><a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a></p>
- Do not include html, head, or body wrapper tags; only the inner fragment that will be injected into an email template.
- Keep the subject line under 120 characters.`;

  const userContent = `voice_and_tone_guide (markdown):\n---\n${input.voiceToneMarkdown}\n---

User brief (what to promote):\n${input.userPrompt}

Scheduled send time (for tone/context only — the user may change it later): ${input.scheduledAtDescription}`;

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
  const parsed = JSON.parse(jsonStr) as { subject?: unknown; html?: unknown };
  const subject =
    typeof parsed.subject === "string" ? parsed.subject.trim() : "";
  const html = typeof parsed.html === "string" ? parsed.html.trim() : "";
  if (!subject || !html) {
    throw new Error('Model JSON must include non-empty "subject" and "html".');
  }
  return { subject, html };
}

import Anthropic from "@anthropic-ai/sdk";
import type { StructuredMinutes } from "schemas/committee_meetings";

const MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6";

export type AttendeeForLlm = {
  id: string;
  full_name: string;
  email: string | null;
};

export type ExtractedActionItem = {
  title: string;
  description: string | null;
  assignee_person_id: string | null;
  due_at: string | null;
};

export type ComposeMeetingMinutesInput = {
  rawTranscript: string;
  agendaText: string;
  attendees: AttendeeForLlm[];
  committeeName: string;
  meetingDate: string;
};

export type ComposeMeetingMinutesResult = {
  structured_minutes: StructuredMinutes;
  action_items: ExtractedActionItem[];
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

export async function composeMeetingMinutes(
  input: ComposeMeetingMinutesInput,
): Promise<ComposeMeetingMinutesResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const client = new Anthropic({ apiKey });

  const attendeeLines = input.attendees
    .map((a) => `- ${a.full_name} (id: ${a.id}${a.email ? `, email: ${a.email}` : ""})`)
    .join("\n");

  const system = `You are an expert secretary for a neighborhood community council (MLCC).

Given a raw meeting transcript, agenda, attendee list, and meeting metadata, produce structured meeting minutes and extract action items.

Output a single JSON object only (no prose before or after) with keys:
- "structured_minutes": object with "blocks" array. Each block is one of:
  - { "kind": "heading", "text": string }
  - { "kind": "paragraph", "text": string }
  - { "kind": "list", "items": string[] }
  Always include sections for Attendance, Discussion highlights (or agenda-aligned topics), and Action items summary in the minutes blocks.
- "action_items": array of objects with:
  - "title" (string): concise action item title
  - "description" (string or null): optional detail
  - "assignee_person_id" (string uuid or null): must be one of the attendee ids when confident; null if unclear
  - "due_at" (string YYYY-MM-DD or null): inferred deadline if mentioned

Rules:
- Align discussion sections with agenda topics when possible.
- Use attendee ids exactly as provided when assigning action items.
- Absent members may still be assigned if clearly named in the transcript.
- Be factual; do not invent decisions not in the transcript.
- Write in clear, professional neighborhood council tone.`;

  const userContent = `Committee: ${input.committeeName}
Meeting date: ${input.meetingDate}

Attendees (use these ids for assignee_person_id):
${attendeeLines || "(none listed)"}

Agenda:
${input.agendaText || "(no agenda provided)"}

Raw transcript / notes:
---
${input.rawTranscript.trim()}
---`;

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

  const parsed = JSON.parse(extractJsonObject(block.text)) as {
    structured_minutes?: { blocks?: unknown };
    action_items?: unknown;
  };

  const blocks = parsed.structured_minutes?.blocks;
  if (!Array.isArray(blocks) || blocks.length === 0) {
    throw new Error('Model JSON must include non-empty structured_minutes.blocks');
  }

  const structured_minutes: StructuredMinutes = {
    blocks: blocks.map((b) => {
      const block = b as Record<string, unknown>;
      if (block.kind === "heading" && typeof block.text === "string") {
        return { kind: "heading" as const, text: block.text };
      }
      if (block.kind === "paragraph" && typeof block.text === "string") {
        return { kind: "paragraph" as const, text: block.text };
      }
      if (block.kind === "list" && Array.isArray(block.items)) {
        return {
          kind: "list" as const,
          items: block.items.filter((i): i is string => typeof i === "string"),
        };
      }
      return { kind: "paragraph" as const, text: String(block.text ?? "") };
    }),
  };

  const validIds = new Set(input.attendees.map((a) => a.id));
  const action_items: ExtractedActionItem[] = [];

  if (Array.isArray(parsed.action_items)) {
    for (const item of parsed.action_items) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const title = typeof o.title === "string" ? o.title.trim() : "";
      if (!title) continue;
      const description =
        typeof o.description === "string" ? o.description.trim() : null;
      let assignee_person_id =
        typeof o.assignee_person_id === "string" ? o.assignee_person_id : null;
      if (assignee_person_id && !validIds.has(assignee_person_id)) {
        assignee_person_id = null;
      }
      const due_at = typeof o.due_at === "string" ? o.due_at.slice(0, 10) : null;
      action_items.push({ title, description, assignee_person_id, due_at });
    }
  }

  return { structured_minutes, action_items };
}

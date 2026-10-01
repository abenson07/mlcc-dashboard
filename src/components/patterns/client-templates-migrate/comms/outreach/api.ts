import { getApiBase } from "@/lib/apiBase";
import { CAPTION_LIMITS } from "@/lib/buffer/imageSpecs";
import { buildPlan, toPacificDay } from "@/lib/marketing/planSchedule";
import type { PlanChannel, PlanIntensity } from "@/lib/marketing/planSchedule";
import type {
  EmailAudienceChoice,
  PersonHit,
  SocialPlatform,
  TouchDraft,
  UploadedImage,
  WhenChoice,
} from "./types";

/** Shape of one item sent to /api/marketing/publish. */
export type PublishItem = {
  id: string;
  channel: PlanChannel;
  when: WhenChoice;
  text?: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  subject?: string;
  html?: string;
  audience?: EmailAudienceChoice;
  recipientIds?: string[];
};

export type PublishResult = { id: string; ok: boolean; externalId?: string; error?: string };

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Request failed.");
  return data;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---- images -------------------------------------------------------------

function readDimensions(objectUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = objectUrl;
  });
}

/** Demo mode keeps images in the browser (object URLs); live mode stores them publicly for Buffer/Resend. */
export async function uploadImage(file: File, demo: boolean): Promise<UploadedImage> {
  const objectUrl = URL.createObjectURL(file);
  const { width, height } = await readDimensions(objectUrl);
  if (demo) return { url: objectUrl, width, height, name: file.name };

  const form = new FormData();
  form.append("file", file);
  form.append("width", String(width));
  form.append("height", String(height));
  const res = await fetch(`${getApiBase()}/api/marketing/social/upload-image`, {
    method: "POST",
    body: form,
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed.");
  return { url: data.url, width, height, name: file.name };
}

// ---- social copy --------------------------------------------------------

export type SocialCaptions = Partial<Record<SocialPlatform, string>>;

export async function composeSocial(
  input: { context: string; verbatim: boolean; platforms: SocialPlatform[]; eventId?: string },
  demo: boolean,
): Promise<SocialCaptions> {
  if (demo) {
    await sleep(600);
    const out: SocialCaptions = {};
    for (const p of input.platforms) {
      const text = input.verbatim
        ? input.context.trim()
        : p === "instagram"
          ? `${input.context.trim().slice(0, 180)} ✨ Link in bio. #MapleLeaf #Seattle`
          : `Neighbors, ${input.context.trim().slice(0, 400)}\n\nHope to see you there!`;
      if (text.length > CAPTION_LIMITS[p]) {
        throw new Error(`The ${p} caption is ${text.length} characters; the limit is ${CAPTION_LIMITS[p]}.`);
      }
      out[p] = text;
    }
    return out;
  }
  const data = await postJson<{ captions: SocialCaptions }>("/api/marketing/social/compose", input);
  return data.captions;
}

// ---- email copy ---------------------------------------------------------

function paragraphsToHtml(text: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

export async function composeEmail(
  input: { context: string; verbatim: boolean },
  demo: boolean,
): Promise<{ subject: string; html: string }> {
  const firstLine = input.context.trim().split("\n")[0].slice(0, 100);
  if (input.verbatim) {
    return { subject: firstLine, html: paragraphsToHtml(input.context) };
  }
  if (demo) {
    await sleep(700);
    return {
      subject: firstLine || "News from MLCC",
      html: `<p>Hi {{{contact.first_name|there}}},</p>${paragraphsToHtml(input.context)}<p>Hope to see you soon,<br>The MLCC team</p>`,
    };
  }
  return postJson<{ subject: string; html: string }>("/api/marketing/email/draft", { prompt: input.context });
}

// ---- event plan ---------------------------------------------------------

export type PlanComposeInput = {
  eventId: string;
  eventName: string;
  eventStartsAt: string;
  channels: PlanChannel[];
  intensity: PlanIntensity;
  context: string;
  verbatim: boolean;
};

export async function composePlan(input: PlanComposeInput, demo: boolean): Promise<TouchDraft[]> {
  if (demo) {
    await sleep(900);
    const plan = buildPlan({
      eventDay: toPacificDay(input.eventStartsAt),
      today: toPacificDay(new Date()),
      intensity: input.intensity,
      channels: input.channels,
    });
    return plan.touches.map((t): TouchDraft => {
      const base = input.verbatim ? input.context.trim() : "";
      if (t.channel === "email") {
        return {
          ...t,
          audience: "all",
          subject: input.verbatim ? input.eventName : `${t.kind === "announcement" ? "You're invited" : "Reminder"} — ${input.eventName}`,
          html: `<p>Hi {{{contact.first_name|there}}},</p><p>${base || `${input.eventName} is ${t.daysBefore === 0 ? "today" : `${t.daysBefore} days away`}.`}</p>`,
        };
      }
      return {
        ...t,
        audience: "all",
        text: base || `${input.eventName} is ${t.daysBefore === 0 ? "today" : t.daysBefore === 1 ? "tomorrow" : `${t.daysBefore} days away`}! Join your neighbors.`,
      };
    });
  }
  const data = await postJson<{ touches: Array<TouchDraft> }>("/api/marketing/plan/compose", {
    eventId: input.eventId,
    channels: input.channels,
    intensity: input.intensity,
    context: input.context,
    verbatim: input.verbatim,
  });
  return data.touches.map((t) => ({ ...t, audience: "all" as const }));
}

// ---- people & publish ---------------------------------------------------

const DEMO_PEOPLE: PersonHit[] = [
  { id: "demo-1", fullName: "Dana Reyes", email: "dana@example.com" },
  { id: "demo-2", fullName: "Sam Okafor", email: "sam@example.com" },
  { id: "demo-3", fullName: "Priya Nair", email: "priya@example.com" },
];

export async function searchPeople(q: string, demo: boolean): Promise<PersonHit[]> {
  if (demo) {
    const needle = q.toLowerCase();
    return DEMO_PEOPLE.filter((p) => p.fullName.toLowerCase().includes(needle));
  }
  const res = await fetch(`${getApiBase()}/api/marketing/people?q=${encodeURIComponent(q)}`);
  const data = (await res.json().catch(() => ({}))) as { people?: PersonHit[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Search failed.");
  return data.people ?? [];
}

/** Demo mode never touches Buffer, Resend, or Anthropic. */
export async function publishItems(items: PublishItem[], demo: boolean): Promise<PublishResult[]> {
  if (demo) {
    await sleep(800);
    return items.map((i) => ({ id: i.id, ok: true }));
  }
  const results: PublishResult[] = [];
  for (let i = 0; i < items.length; i += 40) {
    const data = await postJson<{ results: PublishResult[] }>("/api/marketing/publish", {
      items: items.slice(i, i + 40),
    });
    results.push(...data.results);
  }
  return results;
}

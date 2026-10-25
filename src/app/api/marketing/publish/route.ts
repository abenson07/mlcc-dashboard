import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { CAPTION_LIMITS, imageRequiredForService } from "@/lib/buffer/imageSpecs";
import {
  createScheduledSocialPostsEach,
  type CreateSocialPostInput,
} from "@/lib/buffer/mutations";
import { listSocialPosts } from "@/lib/buffer/queries";
import type { SupportedSocialService } from "@/lib/buffer/types";
import { finalizeEmailHtml, UNSUBSCRIBE_TAG } from "@/lib/marketing/composePlanCopy";
import { loadRecipients, MAX_DIRECT_RECIPIENTS, sendToRecipients } from "@/lib/marketing/sendToPeople";
import { getResendFromEmail } from "@/lib/resend";
import {
  createResendBroadcast,
  getResendAudienceSegmentId,
  type EmailAudience,
} from "@/lib/resendBroadcast";

export const runtime = "nodejs";

const MAX_ITEMS = 40;
/** Buffer needs a future dueAt; "now" posts go out a couple of minutes from now. */
const NOW_LEAD_MS = 2 * 60 * 1000;

type When = { mode: "now" } | { mode: "at"; at: string };

type PublishItem = {
  id: string;
  channel: "facebook" | "instagram" | "email";
  when: When;
  text?: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  /** Optional explicit Buffer channel; otherwise the first connected channel for the service. */
  channelId?: string;
  subject?: string;
  html?: string;
  audience?: EmailAudience;
  /** Specific people (people.id) — email is sent one-to-one instead of to a segment. */
  recipientIds?: string[];
};

type ItemResult = { id: string; ok: boolean; externalId?: string; error?: string };

function parseWhen(raw: unknown): When | null {
  if (!raw || typeof raw !== "object") return null;
  const w = raw as Record<string, unknown>;
  if (w.mode === "now") return { mode: "now" };
  if (w.mode === "at" && typeof w.at === "string" && !Number.isNaN(Date.parse(w.at))) {
    return { mode: "at", at: new Date(w.at).toISOString() };
  }
  return null;
}

function parseItem(raw: unknown): PublishItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const channel = r.channel;
  const when = parseWhen(r.when);
  if (typeof r.id !== "string" || !r.id) return null;
  if (channel !== "facebook" && channel !== "instagram" && channel !== "email") return null;
  if (!when) return null;
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const num = (v: unknown) => (typeof v === "number" ? v : undefined);
  return {
    id: r.id,
    channel,
    when,
    text: str(r.text)?.trim(),
    imageUrl: str(r.imageUrl)?.trim() || undefined,
    imageWidth: num(r.imageWidth),
    imageHeight: num(r.imageHeight),
    channelId: str(r.channelId)?.trim() || undefined,
    subject: str(r.subject)?.trim(),
    html: str(r.html),
    audience: r.audience === "donors" || r.audience === "volunteers" ? r.audience : "all",
    recipientIds: Array.isArray(r.recipientIds)
      ? r.recipientIds.filter((v): v is string => typeof v === "string")
      : undefined,
  };
}

function dueAtFor(when: When): string {
  return when.mode === "now" ? new Date(Date.now() + NOW_LEAD_MS).toISOString() : when.at;
}

/**
 * Sends reviewed outreach: Buffer for social, Resend for email.
 * Always responds 200 with one result per item so one failure never hides the rest.
 */
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  let body: { items?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "items is required." }, { status: 400 });
  }
  if (body.items.length > MAX_ITEMS) {
    return NextResponse.json({ error: `At most ${MAX_ITEMS} items per request.` }, { status: 400 });
  }
  const items: PublishItem[] = [];
  for (const raw of body.items) {
    const item = parseItem(raw);
    if (!item) {
      return NextResponse.json({ error: "Each item needs id, channel, and a valid when." }, { status: 400 });
    }
    items.push(item);
  }

  const results = new Map<string, ItemResult>();
  const fail = (id: string, error: string) => results.set(id, { id, ok: false, error });

  // ---- Social (Buffer) ----
  const social = items.filter((i) => i.channel !== "email");
  if (social.length > 0) {
    try {
      const snapshot = await listSocialPosts();
      const toSend: { item: PublishItem; input: CreateSocialPostInput }[] = [];

      for (const item of social) {
        const service = item.channel as SupportedSocialService;
        const channel = item.channelId
          ? snapshot.channels.find((c) => c.id === item.channelId)
          : snapshot.channels.find((c) => c.service === service && !c.isDisconnected);
        if (!channel || channel.service !== service) {
          fail(item.id, `No connected ${service} channel in Buffer.`);
          continue;
        }
        if (!item.text) {
          fail(item.id, "Caption text is required.");
          continue;
        }
        if (item.text.length > CAPTION_LIMITS[service]) {
          fail(item.id, `Caption is ${item.text.length} characters; ${service} allows ${CAPTION_LIMITS[service]}.`);
          continue;
        }
        if (imageRequiredForService(service) && !item.imageUrl) {
          fail(item.id, "An image is required for Instagram posts.");
          continue;
        }
        const dueAt = dueAtFor(item.when);
        if (Date.parse(dueAt) <= Date.now()) {
          fail(item.id, "Scheduled time must be in the future.");
          continue;
        }
        toSend.push({
          item,
          input: {
            channelId: channel.id,
            text: item.text,
            dueAt,
            imageUrl: item.imageUrl,
            imageWidth: item.imageWidth,
            imageHeight: item.imageHeight,
          },
        });
      }

      const sent = await createScheduledSocialPostsEach(
        toSend.map((s) => s.input),
        snapshot,
      );
      sent.forEach((res, i) => {
        const id = toSend[i].item.id;
        if (res.ok) results.set(id, { id, ok: true, externalId: res.post.id });
        else fail(id, res.message);
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Buffer request failed.";
      for (const item of social) if (!results.has(item.id)) fail(item.id, message);
    }
  }

  // ---- Email (Resend) ----
  for (const item of items.filter((i) => i.channel === "email")) {
    if (!item.subject || !item.html) {
      fail(item.id, "Email needs a subject and body.");
      continue;
    }
    if (item.when.mode === "at" && Date.parse(item.when.at) <= Date.now()) {
      fail(item.id, "Scheduled time must be in the future.");
      continue;
    }
    if (item.recipientIds && item.recipientIds.length > 0) {
      try {
        if (item.recipientIds.length > MAX_DIRECT_RECIPIENTS) {
          fail(item.id, `Pick ${MAX_DIRECT_RECIPIENTS} people or fewer, or use a group.`);
          continue;
        }
        const { recipients, missingEmail } = await loadRecipients(item.recipientIds);
        if (recipients.length === 0) {
          fail(item.id, missingEmail.length ? `No email on file for ${missingEmail.join(", ")}.` : "Recipients not found.");
          continue;
        }
        const sentTo = await sendToRecipients({
          recipients,
          subject: item.subject.slice(0, 200),
          html: item.html,
          scheduledAt: item.when.mode === "at" ? item.when.at : undefined,
        });
        const failures = sentTo.filter((r) => !r.ok);
        const notes = [
          ...failures.map((f) => `${f.email}: ${f.error ?? "failed"}`),
          ...(missingEmail.length ? [`No email on file: ${missingEmail.join(", ")}`] : []),
        ];
        if (failures.length === sentTo.length) fail(item.id, notes.join("; "));
        else results.set(item.id, { id: item.id, ok: true, externalId: `${sentTo.length - failures.length} sent`, ...(notes.length ? { error: notes.join("; ") } : {}) });
      } catch (e) {
        fail(item.id, e instanceof Error ? e.message : "Could not send to those people.");
      }
      continue;
    }
    const segmentId = getResendAudienceSegmentId(item.audience ?? "all");
    if (!segmentId) {
      fail(item.id, `No Resend segment is configured for "${item.audience}".`);
      continue;
    }
    const from = getResendFromEmail();
    if (!from) {
      fail(item.id, "RESEND_FROM_EMAIL is not configured.");
      continue;
    }
    const html = finalizeEmailHtml(item.html);
    if (!html.includes(UNSUBSCRIBE_TAG)) {
      fail(item.id, "Email is missing the unsubscribe link.");
      continue;
    }
    const sent = await createResendBroadcast({
      segmentId,
      from,
      subject: item.subject.slice(0, 200),
      html,
      send: true,
      scheduledAt: item.when.mode === "at" ? item.when.at : undefined,
    });
    if (sent.ok) results.set(item.id, { id: item.id, ok: true, externalId: sent.id });
    else fail(item.id, sent.message);
  }

  const ordered = items.map((i) => results.get(i.id) ?? { id: i.id, ok: false, error: "Not processed." });
  return NextResponse.json({
    results: ordered,
    succeeded: ordered.filter((r) => r.ok).length,
    failed: ordered.filter((r) => !r.ok).length,
  });
}

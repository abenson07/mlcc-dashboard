import { getResendApiKey } from "@/lib/resend";

export type CreateBroadcastParams = {
  segmentId: string;
  from: string;
  subject: string;
  html: string;
  send: boolean;
  scheduledAt?: string;
};

export type CreateBroadcastResult =
  | { ok: true; id: string }
  | { ok: false; status: number; message: string };

/** Resend REST POST /broadcasts (SDK may lag behind API). */
export async function createResendBroadcast(
  params: CreateBroadcastParams
): Promise<CreateBroadcastResult> {
  const key = getResendApiKey();
  if (!key) {
    return { ok: false, status: 503, message: "RESEND_API_KEY is not set." };
  }

  const body: Record<string, unknown> = {
    segment_id: params.segmentId,
    from: params.from,
    subject: params.subject,
    html: params.html,
    send: params.send,
  };
  if (params.scheduledAt) {
    body.scheduled_at = params.scheduledAt;
  }

  const res = await fetch("https://api.resend.com/broadcasts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as { id?: string; message?: string };

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: json?.message || res.statusText || "Resend broadcast failed",
    };
  }

  if (!json?.id || typeof json.id !== "string") {
    return {
      ok: false,
      status: 502,
      message: "Resend returned no broadcast id.",
    };
  }

  return { ok: true, id: json.id };
}

export function getResendMarketingSegmentId(): string | undefined {
  const id = process.env.RESEND_MARKETING_SEGMENT_ID?.trim();
  return id || undefined;
}

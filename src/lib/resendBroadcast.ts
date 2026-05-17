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

export type ResendBroadcastStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed"
  | string;

export type ResendBroadcastListItem = {
  id: string;
  status: ResendBroadcastStatus;
  created_at: string;
  scheduled_at: string | null;
  sent_at: string | null;
  segment_id?: string | null;
};

export type ResendBroadcastDetail = ResendBroadcastListItem & {
  subject: string | null;
  name: string | null;
};

type ListBroadcastsResult =
  | { ok: true; data: ResendBroadcastListItem[] }
  | { ok: false; status: number; message: string };

/** Resend REST GET /broadcasts (paginated). */
export async function listResendBroadcasts(): Promise<ListBroadcastsResult> {
  const key = getResendApiKey();
  if (!key) {
    return { ok: false, status: 503, message: "RESEND_API_KEY is not set." };
  }

  const all: ResendBroadcastListItem[] = [];
  let hasMore = true;
  let after: string | undefined;

  while (hasMore) {
    const url = new URL("https://api.resend.com/broadcasts");
    if (after) url.searchParams.set("after", after);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });

    const json = (await res.json()) as {
      data?: Array<{
        id?: string;
        status?: string;
        created_at?: string;
        scheduled_at?: string | null;
        sent_at?: string | null;
        segment_id?: string | null;
      }>;
      has_more?: boolean;
      message?: string;
    };

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: json?.message || res.statusText || "Failed to list broadcasts.",
      };
    }

    for (const row of json.data ?? []) {
      if (!row.id || typeof row.id !== "string") continue;
      all.push({
        id: row.id,
        status: row.status ?? "draft",
        created_at: row.created_at ?? "",
        scheduled_at: row.scheduled_at ?? null,
        sent_at: row.sent_at ?? null,
        segment_id: row.segment_id ?? null,
      });
    }

    hasMore = json.has_more === true;
    if (hasMore && all.length > 0) {
      after = all[all.length - 1]?.id;
    } else {
      hasMore = false;
    }
  }

  return { ok: true, data: all };
}

type GetBroadcastResult =
  | { ok: true; detail: ResendBroadcastDetail }
  | { ok: false; status: number; message: string };

export async function getResendBroadcast(
  id: string,
): Promise<GetBroadcastResult> {
  const key = getResendApiKey();
  if (!key) {
    return { ok: false, status: 503, message: "RESEND_API_KEY is not set." };
  }

  const res = await fetch(`https://api.resend.com/broadcasts/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });

  const json = (await res.json()) as {
    id?: string;
    status?: string;
    created_at?: string;
    scheduled_at?: string | null;
    sent_at?: string | null;
    segment_id?: string | null;
    subject?: string;
    name?: string;
    message?: string;
  };

  if (!res.ok || !json.id) {
    return {
      ok: false,
      status: res.status,
      message: json?.message || res.statusText || "Failed to load broadcast.",
    };
  }

  return {
    ok: true,
    detail: {
      id: json.id,
      status: json.status ?? "draft",
      created_at: json.created_at ?? "",
      scheduled_at: json.scheduled_at ?? null,
      sent_at: json.sent_at ?? null,
      segment_id: json.segment_id ?? null,
      subject: typeof json.subject === "string" ? json.subject : null,
      name: typeof json.name === "string" ? json.name : null,
    },
  };
}

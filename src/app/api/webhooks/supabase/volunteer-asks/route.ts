import { NextRequest, NextResponse } from "next/server";
import { getSupabaseForVolunteerRoutes } from "@/lib/volunteers/supabaseForVolunteerRoutes";
import {
  getVolunteerAskWebflowConfigIssues,
  isVolunteerAsksWebflowConfigured,
} from "@/lib/webflow/volunteerAskConfig";
import { fetchVolunteerAskById } from "@/lib/volunteers/fetchVolunteerAsk";
import {
  archiveVolunteerAskOnWebflow,
  syncVolunteerAskToWebflow,
} from "@/lib/webflow/volunteerAsks";

type SupabaseDbWebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: Record<string, unknown> | null;
  old_record?: Record<string, unknown> | null;
};

function getWebhookSecret(): string | undefined {
  return process.env.SUPABASE_VOLUNTEER_ASK_WEBHOOK_SECRET?.trim();
}

function authorize(request: NextRequest): boolean {
  const expected = getWebhookSecret();
  if (!expected) return false;
  const header =
    request.headers.get("x-volunteer-ask-webhook-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === expected;
}

function readAskId(payload: SupabaseDbWebhookPayload): string | null {
  const table = payload.table ?? "";
  if (table === "volunteer_asks") {
    const id =
      (payload.record?.id as string | undefined) ??
      (payload.old_record?.id as string | undefined);
    return id?.trim() || null;
  }
  if (table === "volunteers") {
    const id =
      (payload.record?.volunteer_ask_id as string | undefined) ??
      (payload.old_record?.volunteer_ask_id as string | undefined);
    return id?.trim() || null;
  }
  return null;
}

/** Supabase Database Webhook → sync volunteer asks to Webflow CMS. */
export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isVolunteerAsksWebflowConfigured()) {
    return NextResponse.json(
      {
        error: "Webflow volunteer asks collection is not configured.",
        missing: getVolunteerAskWebflowConfigIssues(),
      },
      { status: 503 }
    );
  }

  let payload: SupabaseDbWebhookPayload;
  try {
    payload = (await request.json()) as SupabaseDbWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const table = payload.table ?? "";
  if (table !== "volunteer_asks" && table !== "volunteers") {
    return NextResponse.json({ ok: true, skipped: true, reason: "ignored table" });
  }

  const supabase = await getSupabaseForVolunteerRoutes();

  const askId = readAskId(payload);
  if (!askId) {
    return NextResponse.json({ error: "Missing volunteer ask id in payload" }, { status: 400 });
  }

  const eventType = (payload.type ?? "").toUpperCase();

  if (table === "volunteer_asks" && eventType === "DELETE") {
    const archived = await archiveVolunteerAskOnWebflow(askId);
    return NextResponse.json({ ok: true, archived: archived ?? null });
  }

  const ask = await fetchVolunteerAskById(supabase, askId);
  if (!ask) {
    const archived = await archiveVolunteerAskOnWebflow(askId);
    return NextResponse.json({ ok: true, missing: true, archived: archived ?? null });
  }

  const result = await syncVolunteerAskToWebflow(ask);
  return NextResponse.json({ ok: true, result });
}

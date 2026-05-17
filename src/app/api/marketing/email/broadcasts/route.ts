import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getResendBroadcast,
  listResendBroadcasts,
  type ResendBroadcastListItem,
} from "@/lib/resendBroadcast";
import type { ScheduledEmailRow } from "@/lib/marketing/scheduledEmailTypes";

export const runtime = "nodejs";

export type { ScheduledEmailRow };

function sortBroadcasts(rows: ScheduledEmailRow[]): ScheduledEmailRow[] {
  return [...rows].sort((a, b) => {
    const aKey =
      Date.parse(a.scheduled_at ?? "") ||
      Date.parse(a.sent_at ?? "") ||
      Date.parse(a.created_at ?? "") ||
      0;
    const bKey =
      Date.parse(b.scheduled_at ?? "") ||
      Date.parse(b.sent_at ?? "") ||
      Date.parse(b.created_at ?? "") ||
      0;
    return bKey - aKey;
  });
}

async function enrichWithSubjects(
  items: ResendBroadcastListItem[],
): Promise<ScheduledEmailRow[]> {
  return Promise.all(
    items.map(async (item) => {
      const detail = await getResendBroadcast(item.id);
      const subject = detail.ok
        ? detail.detail.subject ?? detail.detail.name
        : null;
      return {
        id: item.id,
        subject,
        status: item.status,
        scheduled_at: item.scheduled_at,
        sent_at: item.sent_at,
        created_at: item.created_at,
      };
    }),
  );
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const list = await listResendBroadcasts();
    if (!list.ok) {
      return NextResponse.json(
        { error: list.message },
        { status: list.status >= 400 && list.status < 600 ? list.status : 502 },
      );
    }

    const rows = await enrichWithSubjects(list.data);

    return NextResponse.json({ broadcasts: sortBroadcasts(rows) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not load broadcasts.";
    console.error("[marketing/email/broadcasts]", e);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

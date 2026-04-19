import { requireSession } from "@/lib/auth/require-session";
import { getWebflowBannerConfig } from "@/lib/webflow/config";
import { getBannerFieldSlugs } from "@/lib/webflow/field-slugs";
import {
  createBannerItem,
  isWebflowError,
  listAllItems,
  mapItemToBanner,
  type BannerWriteInput,
} from "@/lib/webflow/banners";
import { NextRequest, NextResponse } from "next/server";

function parseInput(body: unknown): BannerWriteInput | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Expected JSON object body." };
  }
  const o = body as Record<string, unknown>;
  const name = typeof o.name === "string" ? o.name : "";
  const message = typeof o.message === "string" ? o.message : "";
  if (!name.trim()) return { error: "name is required." };
  if (!message.trim()) return { error: "message is required." };
  const expiresAt =
    typeof o.expiresAt === "string" && o.expiresAt.trim()
      ? o.expiresAt.trim()
      : null;
  return {
    name,
    message,
    linkUrl: typeof o.linkUrl === "string" ? o.linkUrl : "",
    active: o.active === true,
    expiresAt,
    urgent: o.urgent === true,
    urgentUntil:
      typeof o.urgentUntil === "string" && o.urgentUntil.trim()
        ? o.urgentUntil.trim()
        : null,
    editorNotes:
      typeof o.editorNotes === "string" ? o.editorNotes : undefined,
    confirmReplaceUrgent: o.confirmReplaceUrgent === true,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const wf = getWebflowBannerConfig();
  if (!wf.ok) {
    return NextResponse.json(
      {
        error: "Webflow is not configured for banners.",
        missing: wf.missing,
      },
      { status: 503 }
    );
  }

  const showArchived =
    request.nextUrl.searchParams.get("showArchived") === "1" ||
    request.nextUrl.searchParams.get("showArchived") === "true";

  const slugs = getBannerFieldSlugs();
  const now = Date.now();
  try {
    const raw = await listAllItems(wf.config.token, wf.config.collectionId);
    const mapped = raw.map((it) => mapItemToBanner(it, slugs, now));
    const filtered = showArchived
      ? mapped
      : mapped.filter((b) => !b.isArchived && !b.derived.hiddenByRetention);
    filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return NextResponse.json({ banners: filtered });
  } catch (e) {
    if (isWebflowError(e)) {
      return NextResponse.json(
        { error: e.message, status: e.status },
        { status: e.status >= 400 && e.status < 600 ? e.status : 502 }
      );
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const wf = getWebflowBannerConfig();
  if (!wf.ok) {
    return NextResponse.json(
      {
        error: "Webflow is not configured for banners.",
        missing: wf.missing,
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const slugs = getBannerFieldSlugs();
  const now = Date.now();
  try {
    const { item } = await createBannerItem(
      wf.config.token,
      wf.config.collectionId,
      slugs,
      parsed,
      now
    );
    const banner = mapItemToBanner(item, slugs, now);
    return NextResponse.json({ banner });
  } catch (e) {
    const code = (e as Error & { code?: string }).code;
    if (code === "URGENT_CONFLICT") {
      const conflict = (e as Error & { conflict?: { id: string; name: string } })
        .conflict;
      return NextResponse.json(
        {
          error: (e as Error).message,
          code: "URGENT_CONFLICT",
          conflict,
        },
        { status: 409 }
      );
    }
    if (isWebflowError(e)) {
      return NextResponse.json(
        { error: e.message, status: e.status },
        { status: e.status >= 400 && e.status < 600 ? e.status : 502 }
      );
    }
    if (e instanceof Error && e.message) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

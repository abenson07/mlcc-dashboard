import { NextRequest, NextResponse } from "next/server";
import { requireBufferApiUser, bufferErrorResponse } from "@/lib/buffer/auth";
import {
  createScheduledSocialPost,
  createScheduledSocialPostsBatch,
} from "@/lib/buffer/mutations";
import { getDailyPostingLimits, listSocialPosts } from "@/lib/buffer/queries";
import { imageRequiredForService } from "@/lib/buffer/imageSpecs";
import type { BufferChannelRow } from "@/lib/buffer/types";

export const runtime = "nodejs";

type ChannelPostInput = {
  channelId: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
};

function validateChannelPost(
  item: ChannelPostInput,
  text: string,
  channelById: Map<string, BufferChannelRow>,
): { error: string; status: number } | { ok: true } {
  const channel = channelById.get(item.channelId);
  if (!channel) {
    return {
      error: "Channel not found or not supported (Instagram/Facebook only).",
      status: 400,
    };
  }
  if (imageRequiredForService(channel.service) && !item.imageUrl) {
    return {
      error: "An image is required for Instagram posts.",
      status: 400,
    };
  }
  if (!text) {
    return { error: "Caption text is required.", status: 400 };
  }
  return { ok: true };
}

export async function GET(request: NextRequest) {
  const auth = await requireBufferApiUser();
  if (auth.error) return auth.error;

  try {
    const result = await listSocialPosts();
    const dailyDate = request.nextUrl.searchParams.get("dailyDate");
    const channelIdsParam = request.nextUrl.searchParams.get("channelIds");
    const channelId = request.nextUrl.searchParams.get("channelId");

    let channelIds: string[] = [];
    if (channelIdsParam) {
      channelIds = channelIdsParam.split(",").map((id) => id.trim()).filter(Boolean);
    } else if (channelId) {
      channelIds = [channelId];
    }

    let dailyLimits = undefined;
    if (dailyDate && channelIds.length > 0) {
      const parsed = Date.parse(dailyDate);
      if (!Number.isNaN(parsed)) {
        dailyLimits = await getDailyPostingLimits(
          channelIds,
          new Date(parsed).toISOString(),
        );
      }
    }

    return NextResponse.json({ ...result, dailyLimits });
  } catch (e) {
    return bufferErrorResponse(e);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireBufferApiUser();
  if (auth.error) return auth.error;

  try {
    let body: {
      channelId?: unknown;
      channelPosts?: unknown;
      text?: unknown;
      dueAt?: unknown;
      imageUrl?: unknown;
      imageWidth?: unknown;
      imageHeight?: unknown;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const text = typeof body.text === "string" ? body.text.trim() : "";
    const dueAt = typeof body.dueAt === "string" ? body.dueAt.trim() : "";

    if (!text) {
      return NextResponse.json(
        { error: "Caption text is required." },
        { status: 400 },
      );
    }
    if (!dueAt || Number.isNaN(Date.parse(dueAt))) {
      return NextResponse.json(
        { error: "dueAt must be a valid ISO datetime." },
        { status: 400 },
      );
    }
    if (Date.parse(dueAt) <= Date.now()) {
      return NextResponse.json(
        { error: "Scheduled time must be in the future." },
        { status: 400 },
      );
    }

    const rawBatch = body.channelPosts;
    if (Array.isArray(rawBatch) && rawBatch.length > 0) {
      const channelPosts: ChannelPostInput[] = [];
      for (const entry of rawBatch) {
        if (!entry || typeof entry !== "object") continue;
        const row = entry as Record<string, unknown>;
        const channelId =
          typeof row.channelId === "string" ? row.channelId.trim() : "";
        if (!channelId) continue;
        channelPosts.push({
          channelId,
          imageUrl:
            typeof row.imageUrl === "string" ? row.imageUrl.trim() : undefined,
          imageWidth:
            typeof row.imageWidth === "number" ? row.imageWidth : undefined,
          imageHeight:
            typeof row.imageHeight === "number" ? row.imageHeight : undefined,
        });
      }

      if (channelPosts.length === 0) {
        return NextResponse.json(
          { error: "channelPosts must include at least one channelId." },
          { status: 400 },
        );
      }

      const snapshot = await listSocialPosts();
      const channelById = new Map(
        snapshot.channels.map((c) => [c.id, c]),
      );

      for (const item of channelPosts) {
        const check = validateChannelPost(item, text, channelById);
        if ("error" in check) {
          return NextResponse.json(
            { error: check.error },
            { status: check.status },
          );
        }
      }

      const result = await createScheduledSocialPostsBatch(
        {
          text,
          dueAt,
          posts: channelPosts.map((item) => ({
            channelId: item.channelId,
            text,
            dueAt,
            imageUrl: item.imageUrl,
            imageWidth: item.imageWidth,
            imageHeight: item.imageHeight,
          })),
        },
        snapshot,
      );

      const status = result.errors.length > 0 ? 207 : 200;
      return NextResponse.json(result, { status });
    }

    const channelId =
      typeof body.channelId === "string" ? body.channelId.trim() : "";
    const imageUrl =
      typeof body.imageUrl === "string" ? body.imageUrl.trim() : undefined;
    const imageWidth =
      typeof body.imageWidth === "number" ? body.imageWidth : undefined;
    const imageHeight =
      typeof body.imageHeight === "number" ? body.imageHeight : undefined;

    if (!channelId) {
      return NextResponse.json(
        { error: "channelId or channelPosts is required." },
        { status: 400 },
      );
    }

    const snapshot = await listSocialPosts();
    const channelById = new Map(snapshot.channels.map((c) => [c.id, c]));

    const check = validateChannelPost(
      { channelId, imageUrl, imageWidth, imageHeight },
      text,
      channelById,
    );
    if ("error" in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const post = await createScheduledSocialPost(
      {
        channelId,
        text,
        dueAt,
        imageUrl,
        imageWidth,
        imageHeight,
      },
      snapshot,
    );

    return NextResponse.json({ post });
  } catch (e) {
    return bufferErrorResponse(e);
  }
}

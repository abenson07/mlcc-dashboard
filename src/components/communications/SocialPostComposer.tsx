"use client";

import PlatformImageSlot, {
  emptyPlatformImageSlot,
  type PlatformImageSlotValue,
} from "@/components/communications/PlatformImageSlot";
import Label from "@/components/form/Label";
import { getApiBase } from "@/lib/apiBase";
import {
  CAPTION_LIMITS,
  SHARED_CAPTION_LIMIT,
  imageRequiredForService,
} from "@/lib/buffer/imageSpecs";
import SocialQueueMeters from "@/components/communications/SocialQueueMeters";
import type { BufferChannelRow, ChannelQueueStatus } from "@/lib/buffer/types";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type SocialPostComposerProps = {
  channels: BufferChannelRow[];
  perChannel: ChannelQueueStatus[];
  onScheduled?: () => void;
};

async function uploadImageFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(
    `${getApiBase()}/api/communications/social/upload-image`,
    { method: "POST", body: fd },
  );
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) throw new Error(data.error || "Upload failed");
  if (!data.url) throw new Error("No image URL returned");
  return data.url;
}

export default function SocialPostComposer({
  channels,
  perChannel,
  onScheduled,
}: SocialPostComposerProps) {
  const [text, setText] = useState("");
  const [scheduledLocal, setScheduledLocal] = useState("");
  const [instagramImage, setInstagramImage] = useState<PlatformImageSlotValue>(
    emptyPlatformImageSlot(),
  );
  const [facebookImage, setFacebookImage] = useState<PlatformImageSlotValue>(
    emptyPlatformImageSlot(),
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const instagramChannel = useMemo(
    () => channels.find((c) => c.service === "instagram") ?? null,
    [channels],
  );
  const facebookChannel = useMemo(
    () => channels.find((c) => c.service === "facebook") ?? null,
    [channels],
  );

  const instagramQueue = useMemo(
    () =>
      instagramChannel
        ? perChannel.find((p) => p.channelId === instagramChannel.id)
        : null,
    [perChannel, instagramChannel],
  );
  const facebookQueue = useMemo(
    () =>
      facebookChannel
        ? perChannel.find((p) => p.channelId === facebookChannel.id)
        : null,
    [perChannel, facebookChannel],
  );

  const anyAtLimit =
    instagramQueue?.atLimit === true || facebookQueue?.atLimit === true;

  const activeChannelIds = useMemo(
    () =>
      [instagramChannel?.id, facebookChannel?.id].filter(
        (id): id is string => !!id,
      ),
    [instagramChannel, facebookChannel],
  );

  const resetImages = () => {
    if (instagramImage.preview) URL.revokeObjectURL(instagramImage.preview);
    if (facebookImage.preview) URL.revokeObjectURL(facebookImage.preview);
    setInstagramImage(emptyPlatformImageSlot());
    setFacebookImage(emptyPlatformImageSlot());
  };

  const uploadSlot = async (
    slot: PlatformImageSlotValue,
  ): Promise<{ url: string; width?: number; height?: number } | null> => {
    if (!slot.file) return null;
    if (!slot.ok) {
      throw new Error(slot.validation ?? "Fix image dimensions before uploading.");
    }
    const url = await uploadImageFile(slot.file);
    return {
      url,
      width: slot.dims?.width,
      height: slot.dims?.height,
    };
  };

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("Caption is required.");
      return;
    }
    if (trimmed.length > SHARED_CAPTION_LIMIT) {
      toast.error(
        `Caption exceeds ${SHARED_CAPTION_LIMIT} characters (Instagram limit).`,
      );
      return;
    }
    if (!scheduledLocal) {
      toast.error("Pick a scheduled date and time.");
      return;
    }
    const due = new Date(scheduledLocal);
    if (Number.isNaN(due.getTime()) || due.getTime() <= Date.now()) {
      toast.error("Scheduled time must be in the future.");
      return;
    }

    if (!instagramChannel && !facebookChannel) {
      toast.error("Connect Instagram or Facebook in Buffer first.");
      return;
    }

    if (instagramChannel) {
      if (instagramQueue?.atLimit) {
        toast.error(
          `Instagram queue full (${instagramQueue.used}/${instagramQueue.max}).`,
        );
        return;
      }
      if (imageRequiredForService("instagram") && !instagramImage.file) {
        toast.error("Instagram image is required.");
        return;
      }
      if (instagramImage.file && !instagramImage.ok) {
        toast.error(
          instagramImage.validation ?? "Instagram image dimensions are invalid.",
        );
        return;
      }
    }

    if (facebookChannel) {
      if (facebookQueue?.atLimit) {
        toast.error(
          `Facebook queue full (${facebookQueue.used}/${facebookQueue.max}).`,
        );
        return;
      }
      if (facebookImage.file && !facebookImage.ok) {
        toast.error(
          facebookImage.validation ?? "Facebook image dimensions are invalid.",
        );
        return;
      }
    }

    setSubmitting(true);
    setUploading(true);
    try {
      const channelPosts: Array<{
        channelId: string;
        imageUrl?: string;
        imageWidth?: number;
        imageHeight?: number;
      }> = [];

      if (instagramChannel) {
        let igUrl = instagramImage.url;
        let igW = instagramImage.dims?.width;
        let igH = instagramImage.dims?.height;
        if (instagramImage.file) {
          const uploaded = await uploadSlot(instagramImage);
          if (!uploaded) {
            toast.error("Instagram image upload failed.");
            return;
          }
          igUrl = uploaded.url;
          igW = uploaded.width;
          igH = uploaded.height;
        }
        channelPosts.push({
          channelId: instagramChannel.id,
          ...(igUrl
            ? { imageUrl: igUrl, imageWidth: igW, imageHeight: igH }
            : {}),
        });
      }

      if (facebookChannel) {
        let fbUrl = facebookImage.url;
        let fbW = facebookImage.dims?.width;
        let fbH = facebookImage.dims?.height;
        if (facebookImage.file) {
          const uploaded = await uploadSlot(facebookImage);
          if (!uploaded) {
            toast.error("Facebook image upload failed.");
            return;
          }
          fbUrl = uploaded.url;
          fbW = uploaded.width;
          fbH = uploaded.height;
        }
        channelPosts.push({
          channelId: facebookChannel.id,
          ...(fbUrl
            ? { imageUrl: fbUrl, imageWidth: fbW, imageHeight: fbH }
            : {}),
        });
      }

      setUploading(false);

      const res = await fetch(`${getApiBase()}/api/buffer/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          dueAt: due.toISOString(),
          channelPosts,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        posts?: unknown[];
        errors?: Array<{ channelId: string; message: string }>;
      };

      if (!res.ok && res.status !== 207) {
        throw new Error(data.error || "Could not schedule posts.");
      }

      const partial = data.errors && data.errors.length > 0;
      if (partial) {
        toast.warning(
          `Scheduled ${data.posts?.length ?? 0} post(s). Some failed: ${data.errors!.map((e) => e.message).join("; ")}`,
        );
      } else {
        toast.success(
          channelPosts.length > 1
            ? "Posts scheduled on Instagram and Facebook."
            : "Post scheduled in Buffer.",
        );
      }

      setText("");
      setScheduledLocal("");
      resetImages();
      onScheduled?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not schedule posts.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const disabled =
    submitting || uploading || anyAtLimit || activeChannelIds.length === 0;

  return (
    <div className="space-y-6">
      <SocialQueueMeters perChannel={perChannel} />

      {activeChannelIds.length === 0 ? (
        <p className="text-sm text-amber-800 dark:text-amber-300">
          No Instagram or Facebook channels found in Buffer. Connect them in
          Buffer, then refresh.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="max-w-md">
            <Label htmlFor="social-when">Scheduled for (local time)</Label>
            <input
              id="social-when"
              type="datetime-local"
              value={scheduledLocal}
              onChange={(e) => setScheduledLocal(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          <div>
            <Label htmlFor="social-caption">
              Caption
              <span className="ml-2 font-normal text-gray-400">
                {text.length}/{SHARED_CAPTION_LIMIT}
              </span>
            </Label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Shared for Instagram and Facebook (Instagram max{" "}
              {CAPTION_LIMITS.instagram.toLocaleString()}, Facebook max{" "}
              {CAPTION_LIMITS.facebook.toLocaleString()}).
            </p>
            <textarea
              id="social-caption"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your post…"
              className="mt-2 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <PlatformImageSlot
              service="instagram"
              channel={instagramChannel}
              value={instagramImage}
              onChange={setInstagramImage}
              disabled={submitting || uploading || instagramQueue?.atLimit}
            />
            <PlatformImageSlot
              service="facebook"
              channel={facebookChannel}
              value={facebookImage}
              onChange={setFacebookImage}
              disabled={submitting || uploading || facebookQueue?.atLimit}
            />
          </div>

          {anyAtLimit && (
            <p className="text-sm text-red-700 dark:text-red-400">
              One or more channel queues are full. Remove or publish scheduled
              posts before adding more.
            </p>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={() => void handleSubmit()}
            className="inline-flex items-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 hover:text-white disabled:opacity-50"
          >
            {submitting
              ? uploading
                ? "Uploading images…"
                : "Scheduling…"
              : instagramChannel && facebookChannel
                ? "Schedule to Instagram & Facebook"
                : "Schedule post"}
          </button>
        </div>
      )}
    </div>
  );
}

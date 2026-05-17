"use client";

import SocialServiceIcon from "@/components/communications/SocialServiceIcon";
import type { ChannelQueueStatus } from "@/lib/buffer/types";

type SocialQueueMetersProps = {
  perChannel: ChannelQueueStatus[];
};

export default function SocialQueueMeters({ perChannel }: SocialQueueMetersProps) {
  if (perChannel.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900/40">
      {perChannel.map((p) => (
        <div
          key={p.channelId}
          className="inline-flex items-center gap-2 text-sm tabular-nums"
          title={`${p.channelName} queue`}
        >
          <SocialServiceIcon
            service={p.service}
            className={`size-5 shrink-0 ${
              p.atLimit
                ? "text-amber-600 dark:text-amber-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
          />
          <span
            className={
              p.atLimit
                ? "font-semibold text-amber-800 dark:text-amber-300"
                : "font-medium text-gray-900 dark:text-white/90"
            }
          >
            {p.used}/{p.max} scheduled
          </span>
        </div>
      ))}
    </div>
  );
}

"use client";

import SocialPostComposer from "@/components/communications/SocialPostComposer";
import { Modal } from "@/components/ui/modal";
import type { BufferChannelRow, ChannelQueueStatus } from "@/lib/buffer/types";

type ScheduleSocialModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
  channels: BufferChannelRow[];
  perChannel: ChannelQueueStatus[];
};

export default function ScheduleSocialModal({
  isOpen,
  onClose,
  onScheduled,
  channels,
  perChannel,
}: ScheduleSocialModalProps) {
  const handleScheduled = () => {
    onScheduled();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[92vh] w-full max-w-4xl overflow-y-auto p-0 m-4"
    >
      <div className="p-6 sm:p-8">
        <div className="mb-6 pr-10">
          <h2 className="font-mercury-display text-mercury-h3 font-[450] text-mercury-ink dark:text-white/90">
            Schedule social posts
          </h2>
          <p className="mt-1 text-sm text-mercury-muted dark:text-white/60">
            One time and caption for both channels. Add an image sized for each
            platform. Queue limits apply per channel.
          </p>
        </div>
        <SocialPostComposer
          channels={channels}
          perChannel={perChannel}
          onScheduled={handleScheduled}
        />
      </div>
    </Modal>
  );
}

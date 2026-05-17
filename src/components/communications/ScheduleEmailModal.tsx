"use client";

import MarketingEmailComposer from "@/components/marketing/MarketingEmailComposer";
import { Modal } from "@/components/ui/modal";

type ScheduleEmailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
};

export default function ScheduleEmailModal({
  isOpen,
  onClose,
  onScheduled,
}: ScheduleEmailModalProps) {
  const handleSent = () => {
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
            Schedule email
          </h2>
          <p className="mt-1 text-sm text-mercury-muted dark:text-white/60">
            Draft with AI, review the message, then send immediately or pick a
            scheduled time.
          </p>
        </div>
        <MarketingEmailComposer onSent={handleSent} />
      </div>
    </Modal>
  );
}

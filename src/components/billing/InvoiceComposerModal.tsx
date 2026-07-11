"use client";

import StripeInvoiceComposer from "@/components/billing/StripeInvoiceComposer";
import { Modal } from "@/components/ui/modal";

type InvoiceComposerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  fixedEventId?: string;
  fixedEventLabel?: string;
  defaultLeafletId?: string;
  defaultLeafletLabel?: string;
  defaultDueDate?: string;
  titleOverride?: string;
  onIssued?: (invoiceId: string) => void;
};

export default function InvoiceComposerModal({
  isOpen,
  onClose,
  fixedEventId,
  fixedEventLabel,
  defaultLeafletId,
  defaultLeafletLabel,
  defaultDueDate,
  titleOverride,
  onIssued,
}: InvoiceComposerModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen
      showCloseButton={false}
      className="overflow-hidden p-0"
    >
      <StripeInvoiceComposer
        fullScreen
        onClose={onClose}
        fixedEventId={fixedEventId}
        fixedEventLabel={fixedEventLabel}
        defaultLeafletId={defaultLeafletId}
        defaultLeafletLabel={defaultLeafletLabel}
        defaultDueDate={defaultDueDate}
        titleOverride={titleOverride}
        onIssued={onIssued}
      />
    </Modal>
  );
}

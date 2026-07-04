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
  onIssued?: (invoiceId: string) => void;
};

export default function InvoiceComposerModal({
  isOpen,
  onClose,
  fixedEventId,
  fixedEventLabel,
  defaultLeafletId,
  defaultLeafletLabel,
  onIssued,
}: InvoiceComposerModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen
      showCloseButton
      className="overflow-hidden p-0"
    >
      <StripeInvoiceComposer
        fullScreen
        onClose={onClose}
        fixedEventId={fixedEventId}
        fixedEventLabel={fixedEventLabel}
        defaultLeafletId={defaultLeafletId}
        defaultLeafletLabel={defaultLeafletLabel}
        onIssued={onIssued}
      />
    </Modal>
  );
}

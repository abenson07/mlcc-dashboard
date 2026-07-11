"use client";

import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";

type RemoveDelivererModalProps = {
  personName: string;
  submitting: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export default function RemoveDelivererModal({
  personName,
  submitting,
  onConfirm,
  onCancel,
}: RemoveDelivererModalProps) {
  return (
    <ConfirmDialog
      isOpen
      title="Remove deliverer"
      description={
        <>
          Remove <strong style={{ color: "var(--lf-text)" }}>{personName}</strong> from this route?
          This also clears the route&apos;s default deliverer.
        </>
      }
      confirmLabel="Confirm remove"
      tone="destructive"
      submitting={submitting}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

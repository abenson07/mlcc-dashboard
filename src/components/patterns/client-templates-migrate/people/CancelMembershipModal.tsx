"use client";

import { useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { formatMembershipDate } from "@/lib/memberships/status";
import type { CancelMode } from "@/lib/memberships/cancelMembership";

export type CancelMembershipModalProps = {
  isOpen: boolean;
  memberName: string;
  /** `memberships.current_period_end` — the date the paid period runs out. */
  endsOn: string | null;
  /** Most recent payment, used to state the refund amount plainly. */
  lastPaymentAmount: number | null;
  /** False for a one-time membership: there is no renewal to stop. */
  isSubscription: boolean;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (mode: CancelMode) => void;
};

const linkStyle = {
  background: "none",
  border: "none",
  padding: 0,
  font: "inherit",
  fontSize: 13,
  color: "var(--linear-color-ink-subtle)",
  textDecoration: "underline",
  cursor: "pointer",
} as const;

/**
 * Two distinct actions, deliberately not presented as equals. Stopping the
 * renewal is the ordinary case and is the primary button; refunding moves money
 * back and cannot be undone, so it sits behind a link and its own confirmation.
 */
export function CancelMembershipModal({
  isOpen,
  memberName,
  endsOn,
  lastPaymentAmount,
  isSubscription,
  submitting,
  onCancel,
  onConfirm,
}: CancelMembershipModalProps) {
  // The parent only mounts this while a member is targeted, so the two-step
  // state resets on close without an effect.
  const [confirmingRefund, setConfirmingRefund] = useState(false);

  const endsOnLabel = formatMembershipDate(endsOn);
  const refundLabel = "Cancel and refund now";

  if (confirmingRefund) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onCancel}
        title="Cancel and refund"
        footer={
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button label="Back" variant="ghost" onClick={() => setConfirmingRefund(false)} />
            <Button
              label={submitting ? "Refunding…" : "Refund and cancel now"}
              variant="primary"
              disabled={submitting}
              onClick={() => onConfirm("immediate_refund")}
            />
          </div>
        }
      >
        <Text size="sm">
          {memberName}&rsquo;s membership ends <strong>immediately</strong>, and the full
          {lastPaymentAmount != null ? ` $${lastPaymentAmount.toFixed(2)} ` : " "}
          last payment goes back to their card. This cannot be undone.
        </Text>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Cancel membership"
      footer={
        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "flex-end" }}>
          <button
            type="button"
            style={{
              ...linkStyle,
              ...(submitting ? { opacity: 0.5, cursor: "default" } : null),
            }}
            disabled={submitting}
            onClick={() => setConfirmingRefund(true)}
          >
            {refundLabel}
          </button>
          <Button
            label={submitting ? "Cancelling…" : "Don't renew"}
            variant="primary"
            disabled={submitting || !isSubscription}
            onClick={() => onConfirm("at_period_end")}
          />
        </div>
      }
    >
      <Text size="sm">
        {isSubscription ? (
          <>
            {memberName}&rsquo;s membership will not renew and they won&rsquo;t be charged again.
            {endsOnLabel
              ? ` They keep their membership until ${endsOnLabel}.`
              : " They keep their membership until the end of the period they've paid for."}
          </>
        ) : (
          <>
            {memberName} has a one-time membership, so there is no automatic renewal to stop. You
            can still end it now and refund what they paid.
          </>
        )}
      </Text>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";

type SendConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recipientCount: number;
  onSend: () => Promise<void>;
  sending?: boolean;
};

export default function SendConfirmationModal({
  isOpen,
  onClose,
  recipientCount,
  onSend,
  sending = false,
}: SendConfirmationModalProps) {
  const [confirmText, setConfirmText] = useState("");

  async function handleSend() {
    await onSend();
    setConfirmText("");
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h2 className="lf-h2" style={{ fontSize: 18 }}>Send confirmation request?</h2>
      <p className="lf-page-desc">
        This will email {recipientCount} deliverer{recipientCount === 1 ? "" : "s"} who have not confirmed yet.
      </p>
      <div style={{ marginTop: 16 }}>
        <label className="lf-meta" htmlFor="confirm-input">Type confirm to proceed</label>
        <Input
          id="confirm-input"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="confirm"
          className="mt--2"
        />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
        <Button variant="ghost" onClick={onClose} disabled={sending}>Cancel</Button>
        <Button disabled={confirmText !== "confirm" || sending} onClick={handleSend}>
          {sending ? "Sending…" : "Send"}
        </Button>
      </div>
    </Modal>
  );
}

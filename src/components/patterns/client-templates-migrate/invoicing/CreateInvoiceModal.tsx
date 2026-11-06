"use client";

import { useEffect, useRef, useState } from "react";
import { useEvents, useDemoGuard } from "hooks";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Text } from "@/components/patterns/primitives/Text";
import { getApiBase } from "@/lib/apiBase";
import { parseDollarAmount } from "@/lib/sponsorship/addSponsor";
import { validateEmail } from "@/lib/validation";

const fieldLabelStyle = { fontSize: 12, color: "var(--linear-color-ink-subtle)" } as const;
const selectStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  height: 32,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

export type CreateInvoiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export function CreateInvoiceModal({ isOpen, onClose, onCreated }: CreateInvoiceModalProps) {
  const { events } = useEvents({ autoFetch: isOpen });
  const { enabled: demo, sendDemoEmail } = useDemoGuard();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Invoice");
  const [memo, setMemo] = useState("");
  const [eventId, setEventId] = useState("");
  // A ref, not state: `disabled` only applies after a re-render, and this sends a real invoice.
  const sending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setEmail("");
    setName("");
    setAmount("");
    setDescription("Invoice");
    setMemo("");
    setEventId("");
    setError(null);
  }, [isOpen]);

  async function handleSubmit() {
    if (sending.current) return;
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    const dollars = parseDollarAmount(amount);
    if (dollars === null) {
      setError("Enter a valid amount.");
      return;
    }
    const cents = Math.round(dollars * 100);
    if (!eventId) {
      setError("Select an event (required for Stripe invoices).");
      return;
    }
    sending.current = true;
    setBusy(true);
    setError(null);
    if (demo) {
      try {
        await sendDemoEmail({
          subject: `Invoice — ${description.trim() || "Invoice"}`,
          text: `An invoice for ${amount} would have been issued to ${email.trim()}.`,
          context: email.trim(),
        });
        onClose();
        await onCreated();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not send demo invoice email.");
      } finally {
        sending.current = false;
        setBusy(false);
      }
      return;
    }
    try {
      const res = await fetch(`${getApiBase()}/api/stripe/invoices/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          category: "event",
          eventId,
          memo: memo.trim() || undefined,
          lineItems: [
            {
              description: description.trim() || "Invoice",
              amountCents: cents,
            },
          ],
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not create invoice.");
      onClose();
      await onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create invoice.");
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New invoice"
      width={440}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancel" variant="ghost" onClick={onClose} />
          <Button
            label={busy ? "Sending…" : "Create & send"}
            variant="primary"
            disabled={busy}
            onClick={() => {
              void handleSubmit();
            }}
          />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <TextInput label="Customer email" value={email} onChange={setEmail} />
        <TextInput label="Customer name" value={name} onChange={setName} />
        <TextInput label="Amount (USD)" value={amount} onChange={setAmount} />
        <TextInput label="Line description" value={description} onChange={setDescription} />
        <TextInput label="Memo" value={memo} onChange={setMemo} multiline rows={2} />
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={fieldLabelStyle}>Event</span>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            style={selectStyle}
          >
            <option value="">Select event…</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </label>
        {error ? (
          <Text size="sm" color="secondary">
            {error}
          </Text>
        ) : null}
      </div>
    </Modal>
  );
}

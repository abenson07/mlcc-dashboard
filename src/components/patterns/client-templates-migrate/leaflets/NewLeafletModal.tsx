"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import {
  defaultDeliveryDate,
  defaultSponsorshipDueDate,
} from "@/components/leaflet/leafletData";

export type NewLeafletDraft = {
  title: string;
  distribution_date: string;
  sponsorship_due_date: string;
  delivery_date: string;
};

export type NewLeafletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (leaflet: NewLeafletDraft) => void | Promise<void>;
};

const fieldLabelStyle = { fontSize: 12, color: "var(--linear-color-ink-subtle)" } as const;
const dateInputStyle = {
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

/** Starter form for a new leaflet — enough to create the edition and open its detail page. */
export function NewLeafletModal({ isOpen, onClose, onCreate }: NewLeafletModalProps) {
  const [title, setTitle] = useState("");
  const [distributionDate, setDistributionDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle("");
    setDistributionDate("");
    setSaving(false);
    setError(null);
  }, [isOpen]);

  async function handleSubmit() {
    if (!title.trim() || !distributionDate || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onCreate?.({
        title: title.trim(),
        distribution_date: distributionDate,
        sponsorship_due_date: defaultSponsorshipDueDate(distributionDate),
        delivery_date: defaultDeliveryDate(distributionDate),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create leaflet");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New leaflet"
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label={saving ? "Creating…" : "Create leaflet"}
            variant="primary"
            onClick={() => void handleSubmit()}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TextInput label="Leaflet name" value={title} onChange={setTitle} />

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>Distribution date</span>
          <input
            type="date"
            value={distributionDate}
            onChange={(event) => setDistributionDate(event.target.value)}
            style={dateInputStyle}
          />
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

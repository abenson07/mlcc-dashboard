"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

type CreateLeafletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: { title: string; distribution_date: string }) => Promise<void>;
};

export default function CreateLeafletModal({
  isOpen,
  onClose,
  onCreate,
}: CreateLeafletModalProps) {
  const [title, setTitle] = useState("");
  const [distributionDate, setDistributionDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !distributionDate) return;
    setSaving(true);
    setError(null);
    try {
      await onCreate({ title: title.trim(), distribution_date: distributionDate });
      setTitle("");
      setDistributionDate("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create leaflet");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h2 className="lf-h2" style={{ fontSize: 18 }}>Schedule new leaflet</h2>
      <p className="lf-page-desc">Creates a planned edition and copies routes into deliveries.</p>
      <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <Label htmlFor="leaflet-title">Title</Label>
          <Input
            id="leaflet-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="December 2026 Leaflet"
          />
        </div>
        <div>
          <Label htmlFor="leaflet-date">Distribution date</Label>
          <Input
            id="leaflet-date"
            type="date"
            value={distributionDate}
            onChange={(e) => setDistributionDate(e.target.value)}
          />
        </div>
        {error && <p className="lf-text-red" style={{ fontSize: 13 }}>{error}</p>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !title.trim() || !distributionDate}>
            {saving ? "Creating…" : "Create leaflet"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

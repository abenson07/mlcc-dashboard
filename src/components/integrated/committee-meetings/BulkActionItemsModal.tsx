"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { getApiBase } from "@/lib/apiBase";

type BulkActionItemsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  committeeMeetingId: string;
  onImported: () => void;
};

export default function BulkActionItemsModal({
  isOpen,
  onClose,
  committeeMeetingId,
  onImported,
}: BulkActionItemsModalProps) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBase()}/api/action-items/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ committee_meeting_id: committeeMeetingId, text }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Import failed");
      setText("");
      onImported();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6">
      <h2 className="lf-h2" style={{ fontSize: 18 }}>Bulk import action items</h2>
      <p className="lf-page-desc">
        One item per line: <code>Title | assignee@email.com | YYYY-MM-DD</code>
      </p>
      <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <Label htmlFor="bulk-items">Items</Label>
          <textarea
            id="bulk-items"
            className="lf-textarea"
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Publish summary | jane@example.com | 2026-03-01\nSchedule follow-up | bob@example.com"}
          />
        </div>
        {error && <p className="lf-text-red">{error}</p>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !text.trim()}>
            {saving ? "Importing…" : "Import"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

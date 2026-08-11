"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useEventTemplates, type CreateEventPayload } from "hooks";

type CreateEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateEventPayload) => Promise<void>;
  /** Prefill event name (e.g. from list search). */
  initialName?: string;
};

export default function CreateEventModal({
  isOpen,
  onClose,
  onCreate,
  initialName = "",
}: CreateEventModalProps) {
  const { templates } = useEventTemplates({ autoFetch: isOpen });
  const [name, setName] = useState(initialName);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setError(null);
    }
  }, [isOpen, initialName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !startsAt) return;
    setSaving(true);
    setError(null);
    try {
      const starts_at = new Date(startsAt).toISOString();
      const ends_at = endsAt ? new Date(endsAt).toISOString() : null;
      await onCreate({
        name: name.trim(),
        starts_at,
        ends_at,
        event_template_id: templateId || null,
      });
      setName("");
      setStartsAt("");
      setEndsAt("");
      setTemplateId("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h2 className="lf-h2" style={{ fontSize: 18 }}>New event</h2>
      <p className="lf-page-desc">
        Creates a dashboard event in draft state. Pick an event type to start from a preset, or
        leave it as a custom event.
      </p>
      <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <Label htmlFor="event-name">Event name</Label>
          <Input
            id="event-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Summer Block Party 2026"
          />
        </div>
        <div>
          <Label htmlFor="event-starts">Starts</Label>
          <Input
            id="event-starts"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="event-ends">Ends (optional)</Label>
          <Input
            id="event-ends"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </div>
        {templates.length > 0 && (
          <div>
            <Label htmlFor="event-template">Event type</Label>
            <select
              id="event-template"
              className="lf-select"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">Custom event</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {error && <p className="lf-text-red" style={{ fontSize: 13 }}>{error}</p>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !name.trim() || !startsAt}>
            {saving ? "Creating…" : "Create event"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";

type AddEventTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultOffsetDays?: number;
  onSubmit: (payload: {
    title: string;
    offset_days: number;
    description?: string | null;
  }) => Promise<void>;
};

export default function AddEventTaskModal({
  isOpen,
  onClose,
  defaultOffsetDays = -14,
  onSubmit,
}: AddEventTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [offsetDays, setOffsetDays] = useState(String(defaultOffsetDays));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setDescription("");
    setOffsetDays(String(defaultOffsetDays));
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title is required.");
      return;
    }
    const offset = Number.parseInt(offsetDays, 10);
    if (!Number.isFinite(offset)) {
      setError("Enter a valid offset in days.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title: trimmed,
        offset_days: offset,
        description: description.trim() || null,
      });
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6">
      <form onSubmit={(e) => void handleSubmit(e)}>
        <h2 className="lf-h2" style={{ marginBottom: 16 }}>
          Add task
        </h2>

        {error ? <p className="lf-text-red" style={{ marginBottom: 12 }}>{error}</p> : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <Label>Title</Label>
            <Input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label>Description (optional)</Label>
            <TextArea
              rows={3}
              placeholder="Notes"
              value={description}
              onChange={setDescription}
            />
          </div>

          <div>
            <Label>Days from event start</Label>
            <Input
              type="number"
              step={1}
              value={offsetDays}
              onChange={(e) => setOffsetDays(e.target.value)}
            />
            <p className="lf-meta" style={{ marginTop: 4 }}>
              Negative = before the event (e.g. -30 is 30 days before).
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
          <Button type="button" size="sm" variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "Adding…" : "Add task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import type { EventCategory, EventSummary } from "@/data/mocks/events";

export type NewEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (event: Omit<EventSummary, "id">) => void;
};

const CATEGORIES: EventCategory[] = ["Community", "Social", "Recreation", "Meeting"];

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

/** Starter form for a new event — just enough to create the record and open its detail page. */
export function NewEventModal({ isOpen, onClose, onCreate }: NewEventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<EventCategory>(CATEGORIES[0]);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setTitle("");
    setDate("");
    setLocation("");
    setCategory(CATEGORIES[0]);
    setDescription("");
  }, [isOpen]);

  function handleSubmit() {
    if (!title.trim() || !date) return;
    onCreate?.({
      title: title.trim(),
      date,
      location: location.trim(),
      category,
      description: description.trim(),
    });
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New event"
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label="Create event" variant="primary" onClick={handleSubmit} />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TextInput label="Event title" value={title} onChange={setTitle} />

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            style={selectStyle}
          />
        </label>

        <TextInput label="Location" value={location} onChange={setLocation} />

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as EventCategory)}
            style={selectStyle}
          >
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <TextInput
          label="Description"
          value={description}
          onChange={setDescription}
          multiline
          rows={3}
        />
      </div>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { IconButton } from "@/components/patterns/shared/IconButton";
import type { EventPromotionItem, EventPromotionType } from "@/data/mocks/events";

export type PromotionInsertRowProps = {
  onInsert: (item: Omit<EventPromotionItem, "id">) => void;
};

/**
 * Slim "+" affordance between promotion cards — expands into an inline
 * form for adding a new email or social post at that point in the timeline.
 */
export function PromotionInsertRow({ onInsert }: PromotionInsertRowProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState<EventPromotionType>("email");
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("");
  const [sendDate, setSendDate] = useState("");

  function reset() {
    setIsAdding(false);
    setType("email");
    setTitle("");
    setChannel("");
    setSendDate("");
  }

  if (!isAdding) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 1, background: "var(--linear-color-hairline)" }} />
        <IconButton
          label="Add promotion item"
          variant="secondary"
          size="sm"
          icon={<Plus size={14} strokeWidth={1.75} />}
          onClick={() => setIsAdding(true)}
        />
        <div style={{ flex: 1, height: 1, background: "var(--linear-color-hairline)" }} />
      </div>
    );
  }

  function handleSave() {
    if (!title.trim() || !sendDate) return;
    onInsert({
      type,
      channel: channel.trim() || (type === "email" ? "Newsletter" : "Social"),
      title: title.trim(),
      description: "",
      sendDate,
      status: "Draft",
    });
    reset();
  }

  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={2} align="center">
          <Button
            label="Email"
            variant={type === "email" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setType("email")}
          />
          <Button
            label="Social post"
            variant={type === "social" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setType("social")}
          />
          <span style={{ flex: 1 }} />
          <IconButton
            label="Cancel"
            variant="ghost"
            size="sm"
            icon={<X size={14} strokeWidth={1.75} />}
            onClick={reset}
          />
        </HStack>

        <TextInput label="Title" value={title} onChange={setTitle} />
        <TextInput
          label={type === "email" ? "List / send-from" : "Channel"}
          value={channel}
          onChange={setChannel}
        />
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>Send date</span>
          <input
            type="date"
            value={sendDate}
            onChange={(event) => setSendDate(event.target.value)}
            style={{
              boxSizing: "border-box",
              width: "100%",
              height: 32,
              paddingInline: 8,
              borderRadius: 6,
              border: "var(--linear-border-width) solid var(--linear-color-hairline)",
              background: "var(--linear-color-canvas)",
              color: "var(--linear-color-ink)",
              fontSize: 13,
              fontFamily: "inherit",
            }}
          />
        </label>

        <Button
          label={type === "email" ? "Add email" : "Add social post"}
          variant="primary"
          size="sm"
          width="100%"
          onClick={handleSave}
        />
      </VStack>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { CalendarCheck, Tag, User } from "lucide-react";
import { Button } from "@/components/patterns/primitives/Button";
import { HStack } from "@/components/patterns/primitives/Stack";
import { PropertyChip } from "@/components/patterns/client-templates/shared";
import { RichTextEditor } from "./RichTextEditor";
import { availableTopics, type Story } from "@/data/mocks/content";

export type StoryFormPanelProps = {
  story: Story;
  isNew?: boolean;
  onSave: (story: Story) => void;
  onClose: () => void;
};

function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function StoryFormPanel({ story, isNew = false, onSave, onClose }: StoryFormPanelProps) {
  const [draft, setDraft] = useState<Story>(story);

  function cycleTopic() {
    setDraft((d) => {
      const currentIndex = availableTopics.indexOf(d.topic);
      const next = availableTopics[(currentIndex + 1) % availableTopics.length];
      return { ...d, topic: next };
    });
  }

  function togglePublished() {
    setDraft((d) =>
      d.status === "Published"
        ? { ...d, status: "Draft" }
        : { ...d, status: "Published", publishedAt: todayLabel() },
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 16 }}>
      <input
        value={draft.title}
        onChange={(event) => setDraft((d) => ({ ...d, title: event.target.value }))}
        placeholder="Untitled story"
        autoFocus={isNew}
        style={{
          all: "unset",
          boxSizing: "border-box",
          width: "100%",
          fontSize: 28,
          fontWeight: 600,
          lineHeight: "34px",
          color: "var(--linear-color-ink)",
        }}
      />

      <div style={{ flex: 1, minHeight: 0 }}>
        <RichTextEditor
          bare
          content={draft.body}
          placeholder="Start writing the story…"
          onChange={(body) => setDraft((d) => ({ ...d, body }))}
        />
      </div>

      <div
        style={{
          borderTop: "var(--linear-border-width) solid var(--linear-color-hairline)",
          paddingTop: 12,
        }}
      >
        <HStack gap={1} style={{ flexWrap: "wrap" }}>
          <PropertyChip id="author" label={draft.author} icon={<User size={14} strokeWidth={1.75} />} />
          <PropertyChip
            id="topic"
            label={draft.topic || "Add topic"}
            icon={<Tag size={14} strokeWidth={1.75} />}
            onClick={cycleTopic}
          />
          <PropertyChip
            id="status"
            label={draft.status === "Published" ? `Published · ${draft.publishedAt}` : "Draft"}
            icon={<CalendarCheck size={14} strokeWidth={1.75} />}
            onClick={togglePublished}
          />
        </HStack>
      </div>

      <HStack gap={2} justify="end">
        <Button label="Close" variant="secondary" onClick={onClose} />
        <Button label={isNew ? "Create story" : "Save"} variant="primary" onClick={() => onSave(draft)} />
      </HStack>
    </div>
  );
}

"use client";

import { useState } from "react";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Switch } from "@/components/patterns/primitives/Switch";
import { Button } from "@/components/patterns/primitives/Button";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Text } from "@/components/patterns/primitives/Text";
import { RichTextEditor } from "./RichTextEditor";
import type { Story } from "./types";

export type StoryFormPanelProps = {
  story: Story;
  onSave: (story: Story) => void;
  onClose: () => void;
};

export function StoryFormPanel({ story, onSave, onClose }: StoryFormPanelProps) {
  const [draft, setDraft] = useState<Story>(story);

  return (
    <VStack gap={5}>
      <Text type="label" color="secondary">
        Edit story
      </Text>
      <TextInput
        label="Title"
        value={draft.title}
        onChange={(title) => setDraft((d) => ({ ...d, title }))}
      />
      <TextInput
        label="Author"
        value={draft.author}
        onChange={(author) => setDraft((d) => ({ ...d, author }))}
      />
      <RichTextEditor
        label="Body"
        content={draft.body}
        onChange={(body) => setDraft((d) => ({ ...d, body }))}
      />
      <Switch
        label="Published"
        value={draft.status === "Published"}
        onChange={(isPublished) =>
          setDraft((d) => ({ ...d, status: isPublished ? "Published" : "Draft" }))
        }
      />
      <HStack gap={2} justify="end">
        <Button label="Close" variant="secondary" onClick={onClose} />
        <Button label="Save" variant="primary" onClick={() => onSave(draft)} />
      </HStack>
    </VStack>
  );
}

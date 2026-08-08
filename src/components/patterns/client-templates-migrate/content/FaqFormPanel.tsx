"use client";

import { useState } from "react";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { Button } from "@/components/patterns/primitives/Button";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Text } from "@/components/patterns/primitives/Text";
import { FAQ_PAGE_OPTIONS } from "schemas/faqs";
import type { Faq } from "./types";

export type FaqFormPanelProps = {
  faq: Faq;
  onSave: (faq: Faq) => void;
  onClose: () => void;
};

export function FaqFormPanel({ faq, onSave, onClose }: FaqFormPanelProps) {
  const [draft, setDraft] = useState<Faq>(faq);

  function togglePage(page: string, isChecked: boolean) {
    setDraft((d) => ({
      ...d,
      pages: isChecked ? [...d.pages, page] : d.pages.filter((p) => p !== page),
    }));
  }

  return (
    <VStack gap={5}>
      <Text type="label" color="secondary">
        Edit FAQ
      </Text>
      <TextInput
        label="Question"
        value={draft.question}
        onChange={(question) => setDraft((d) => ({ ...d, question }))}
      />
      <TextInput
        label="Answer"
        value={draft.answer}
        onChange={(answer) => setDraft((d) => ({ ...d, answer }))}
        multiline
        rows={5}
      />
      <VStack gap={2}>
        <Text type="label" color="secondary">
          Shown on pages
        </Text>
        <VStack gap={2}>
          {FAQ_PAGE_OPTIONS.map((option) => (
            <Checkbox
              key={option.slug}
              label={option.label}
              value={draft.pages.includes(option.slug)}
              onChange={(isChecked) => togglePage(option.slug, isChecked)}
            />
          ))}
        </VStack>
      </VStack>
      <HStack gap={2} justify="end">
        <Button label="Close" variant="secondary" onClick={onClose} />
        <Button label="Save" variant="primary" onClick={() => onSave(draft)} />
      </HStack>
    </VStack>
  );
}

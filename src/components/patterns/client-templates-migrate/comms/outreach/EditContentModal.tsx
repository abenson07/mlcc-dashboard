"use client";

import { useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { CAPTION_LIMITS } from "@/lib/buffer/imageSpecs";
import { TextArea } from "./ui";
import type { SocialPlatform } from "./types";

/** Mounts the form only while open so each edit starts from the current text. */
export function EditContentModal(props: EditContentModalProps) {
  return props.isOpen ? <EditContentForm {...props} /> : null;
}

type EditContentModalProps = {
  isOpen: boolean;
  platform: SocialPlatform;
  text: string;
  onClose: () => void;
  onSave: (next: string) => void;
};

function EditContentForm({ isOpen, platform, text, onClose, onSave }: EditContentModalProps) {
  const [draft, setDraft] = useState(text);
  const limit = CAPTION_LIMITS[platform];
  const over = draft.length > limit;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit content"
      width={520}
      footer={
        <>
          <Button label="Cancel" onClick={onClose} />
          <Button
            label="Save"
            variant="primary"
            disabled={!draft.trim() || over}
            onClick={() => {
              onSave(draft.trim());
              onClose();
            }}
          />
        </>
      }
    >
      <TextArea ariaLabel="Post text" value={draft} onChange={setDraft} rows={9} />
      <div style={{ fontSize: 12, marginTop: 6, textAlign: "right", color: over ? "#e5484d" : "var(--linear-color-ink-subtle)" }}>
        {draft.length.toLocaleString()} / {limit.toLocaleString()}
      </div>
    </Modal>
  );
}

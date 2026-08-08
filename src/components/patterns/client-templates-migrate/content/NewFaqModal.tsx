"use client";

import { useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import type { Faq } from "./types";

export type NewFaqModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (faq: Omit<Faq, "id">) => void;
};

/** Starter form for a new FAQ — question and answer; which pages show it are set from the edit panel. */
export function NewFaqModal({ isOpen, onClose, onCreate }: NewFaqModalProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  function reset() {
    setQuestion("");
    setAnswer("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (!question.trim() || !answer.trim()) return;
    onCreate?.({
      question: question.trim(),
      answer: answer.trim(),
      pages: [],
    });
    reset();
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New FAQ"
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={handleClose} />
          <Button label="Create FAQ" variant="primary" onClick={handleSubmit} />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TextInput label="Question" value={question} onChange={setQuestion} />
        <TextInput label="Answer" value={answer} onChange={setAnswer} multiline rows={5} />
      </div>
    </Modal>
  );
}

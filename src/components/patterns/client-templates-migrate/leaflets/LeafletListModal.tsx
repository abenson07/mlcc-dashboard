"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Modal } from "@/components/patterns/shared/Modal";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { Text } from "@/components/patterns/primitives/Text";

export type LeafletListModalProps = {
  isOpen: boolean;
  names: string[];
  onClose: () => void;
};

/** Member businesses for this leaflet — copy one name or the full list. */
export function LeafletListModal({ isOpen, names, onClose }: LeafletListModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1500);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Business List" width={380}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton
            label={copiedKey === "all" ? "Copied" : "Copy all"}
            variant="ghost"
            size="sm"
            icon={
              copiedKey === "all" ? (
                <Check size={14} strokeWidth={1.75} color="#27a644" />
              ) : (
                <Copy size={14} strokeWidth={1.75} />
              )
            }
            onClick={() => void copyText("all", names.join("\n"))}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 320, overflow: "auto" }}>
          {names.length === 0 ? (
            <Text size="sm" color="secondary">
              No member businesses yet.
            </Text>
          ) : (
            names.map((name) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "6px 4px",
                }}
              >
                <Text size="sm">{name}</Text>
                <IconButton
                  label={copiedKey === name ? "Copied" : `Copy ${name}`}
                  variant="ghost"
                  size="sm"
                  icon={
                    copiedKey === name ? (
                      <Check size={14} strokeWidth={1.75} color="#27a644" />
                    ) : (
                      <Copy size={14} strokeWidth={1.75} />
                    )
                  }
                  onClick={() => void copyText(name, name)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

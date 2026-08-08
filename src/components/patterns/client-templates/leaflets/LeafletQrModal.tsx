"use client";

import { useState } from "react";
import { Check, Copy, Plus, QrCode as QrCodeIcon } from "lucide-react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { Text } from "@/components/patterns/primitives/Text";
import { sampleLeafletQrCodes, type LeafletQrCode } from "@/data/mocks/leaflets";

export type LeafletQrModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/** QR codes for this leaflet — pick one and copy its link, or generate a new code. */
export function LeafletQrModal({ isOpen, onClose }: LeafletQrModalProps) {
  const [codes, setCodes] = useState<LeafletQrCode[]>(sampleLeafletQrCodes);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(code: LeafletQrCode) {
    try {
      await navigator.clipboard.writeText(code.url);
      setCopiedId(code.id);
      setTimeout(() => setCopiedId((current) => (current === code.id ? null : current)), 1500);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  function handleGenerate() {
    const id = `qr-generated-${Date.now()}`;
    setCodes((prev) => [
      ...prev,
      {
        id,
        label: `New QR Code ${prev.length + 1}`,
        url: `https://mapleleafcommunity.org/qr/${id}`,
      },
    ]);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR codes" width={380}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {codes.map((code) => (
          <div
            key={code.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 4px",
              borderRadius: "var(--linear-radius-sm)",
            }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "var(--linear-radius-sm)",
                background: "var(--linear-color-icon-button-secondary)",
                flexShrink: 0,
              }}
            >
              <QrCodeIcon size={16} strokeWidth={1.75} color="var(--linear-color-ink-subtle)" />
            </span>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
              <Text size="sm">{code.label}</Text>
              {code.subtitle ? (
                <Text size="sm" color="secondary">
                  {code.subtitle}
                </Text>
              ) : null}
            </div>
            <IconButton
              label={copiedId === code.id ? "Copied" : `Copy ${code.label} link`}
              variant="ghost"
              size="sm"
              icon={
                copiedId === code.id ? (
                  <Check size={14} strokeWidth={1.75} color="#27a644" />
                ) : (
                  <Copy size={14} strokeWidth={1.75} />
                )
              }
              onClick={() => void handleCopy(code)}
            />
          </div>
        ))}
      </div>

      <Button
        label="Generate new QR code"
        variant="secondary"
        size="sm"
        width="100%"
        icon={<Plus size={14} strokeWidth={1.75} />}
        onClick={handleGenerate}
      />
    </Modal>
  );
}

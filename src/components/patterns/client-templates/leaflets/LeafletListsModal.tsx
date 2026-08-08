"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Modal } from "@/components/patterns/shared/Modal";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { Text } from "@/components/patterns/primitives/Text";
import {
  sampleLeafletBusinessList,
  sampleLeafletUpcomingEvents,
  type LeafletListView,
} from "@/data/mocks/leaflets";

export type LeafletListsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function formatEventDate(dateIso: string): string {
  return new Date(`${dateIso}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Lists for leaflet" — Business List / Upcoming Events, each copyable. Modeled on `ListsForLeafletWidget`. */
export function LeafletListsModal({ isOpen, onClose }: LeafletListsModalProps) {
  const [view, setView] = useState<LeafletListView>("members");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const lines = useMemo(
    () =>
      view === "members"
        ? sampleLeafletBusinessList
        : sampleLeafletUpcomingEvents.map((event) => `${event.title} — ${formatEventDate(event.date)}`),
    [view],
  );

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
    <Modal isOpen={isOpen} onClose={onClose} title="Lists for leaflet" width={380}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "inline-flex",
              padding: 2,
              borderRadius: "var(--linear-radius-sm)",
              background: "var(--linear-color-icon-button-secondary)",
            }}
          >
            {(["members", "events"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                style={{
                  all: "unset",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  padding: "4px 10px",
                  borderRadius: "var(--linear-radius-sm)",
                  fontSize: 12,
                  fontWeight: 500,
                  background: view === option ? "var(--linear-color-canvas)" : "transparent",
                  color: view === option ? "var(--linear-color-ink)" : "var(--linear-color-ink-subtle)",
                }}
              >
                {option === "members" ? "Business List" : "Upcoming Events"}
              </button>
            ))}
          </div>
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
            onClick={() => void copyText("all", lines.join("\n"))}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 320, overflow: "auto" }}>
          {view === "members"
            ? sampleLeafletBusinessList.map((name) => (
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
            : sampleLeafletUpcomingEvents.map((event) => {
                const line = `${event.title} — ${formatEventDate(event.date)}`;
                return (
                  <div
                    key={event.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      padding: "6px 4px",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                      <Text size="sm">{event.title}</Text>
                      <Text size="sm" color="secondary">
                        {formatEventDate(event.date)}
                      </Text>
                    </div>
                    <IconButton
                      label={copiedKey === event.id ? "Copied" : `Copy ${event.title}`}
                      variant="ghost"
                      size="sm"
                      icon={
                        copiedKey === event.id ? (
                          <Check size={14} strokeWidth={1.75} color="#27a644" />
                        ) : (
                          <Copy size={14} strokeWidth={1.75} />
                        )
                      }
                      onClick={() => void copyText(event.id, line)}
                    />
                  </div>
                );
              })}
        </div>
      </div>
    </Modal>
  );
}

"use client";

import { CalendarDays, Mail, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import { OutreachShell } from "./OutreachShell";
import type { OutreachMode } from "./OutreachOverlay";

const OPTIONS: { mode: Exclude<OutreachMode, "picker">; title: string; sub: string; icon: ReactNode }[] = [
  { mode: "social", title: "One social post", sub: "Facebook · Instagram", icon: <MessageSquare size={22} strokeWidth={1.5} /> },
  { mode: "email", title: "One email", sub: "Group or specific members", icon: <Mail size={22} strokeWidth={1.5} /> },
  { mode: "plan", title: "Event plan", sub: "Posts + emails around a date", icon: <CalendarDays size={22} strokeWidth={1.5} /> },
];

/** Full-screen "What do you want to create?" picker. */
export function OutreachPicker({ onPick, onClose }: { onPick: (mode: Exclude<OutreachMode, "picker">) => void; onClose: () => void }) {
  return (
    <OutreachShell
      onClose={onClose}
      left={
        <div style={{ paddingTop: 40 }}>
          <div style={{ fontSize: 22, fontWeight: 510, marginBottom: 20 }}>What do you want to create?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {OPTIONS.map((o) => (
              <button
                key={o.mode}
                type="button"
                onClick={() => onPick(o.mode)}
                style={{
                  all: "unset",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: 16,
                  borderRadius: 12,
                  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                  background: "var(--linear-color-canvas)",
                }}
              >
                <span style={{ color: "var(--linear-color-ink-subtle)", display: "flex" }}>{o.icon}</span>
                <span>
                  <div style={{ fontSize: 15, fontWeight: 510 }}>{o.title}</div>
                  <div style={{ fontSize: 13, color: "var(--linear-color-ink-subtle)" }}>{o.sub}</div>
                </span>
              </button>
            ))}
          </div>
        </div>
      }
      right={
        <div
          style={{
            height: "100%",
            minHeight: 240,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--linear-color-ink-subtle)",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          Pick what you want to make. Previews show up here as you go.
        </div>
      }
    />
  );
}

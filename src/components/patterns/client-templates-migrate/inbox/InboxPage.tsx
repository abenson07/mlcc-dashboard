"use client";

import { useMemo, useState } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { sampleInboxMessages, type InboxMessage } from "@/data/mocks/inbox";
import { InboxList } from "./InboxList";
import { InboxReadingPane } from "./InboxReadingPane";

/** Demo-only two-pane email client — simulated inbound mail, styling reference only. */
export function InboxPage() {
  const [messages, setMessages] = useState<InboxMessage[]>(sampleInboxMessages);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => messages.find((m) => m.id === selectedId) ?? null, [messages, selectedId]);

  function selectMessage(id: string) {
    setSelectedId(id);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: "read" } : m)));
  }

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={<CanvasHeader topbar={{ title: "Inbox" }} />}
      >
        <div style={{ display: "flex", height: "100%", minHeight: 0, boxSizing: "border-box" }}>
          <InboxList messages={messages} selectedId={selectedId} onSelect={selectMessage} />
          <InboxReadingPane message={selected} />
        </div>
      </FoundationLayout>
    </div>
  );
}

"use client";

import { useState } from "react";
import { PenSquare } from "lucide-react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { Button } from "@/components/patterns/primitives/Button";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { OutreachOverlay } from "./outreach/OutreachOverlay";

export function CommsDemo() {
  const { enabled: demo } = useDemoModeOptional();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={<CanvasHeader topbar={{ title: "Comms" }} />}
      >
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "80px 24px",
            textAlign: "center",
          }}
        >
          <PenSquare size={22} strokeWidth={1.5} color="var(--linear-color-ink-subtle)" />
          <div style={{ fontSize: 15, fontWeight: 510, color: "var(--linear-color-ink)" }}>Create outreach</div>
          <div style={{ fontSize: 13, color: "var(--linear-color-ink-subtle)", maxWidth: 360 }}>
            Write a social post or email, or plan a whole run-up to an event. We&apos;ll help with the wording.
          </div>
          <Button label="New outreach" variant="primary" size="md" onClick={() => setOpen(true)} />
        </div>
      </FoundationLayout>
      {open ? <OutreachOverlay demo={demo} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

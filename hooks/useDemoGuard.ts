"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import {
  applyOverlay,
  patchOverlayEntity,
  readOverlay,
  type DemoOverlay,
  type DemoOverlayKind,
} from "@/lib/demo/demoOverlay";

export type DemoGuardOptions = {
  /** Human label used in the default toast, e.g. "Person updated". */
  action: string;
  successMessage?: string;
};

export type SendDemoEmailPayload = {
  subject: string;
  text: string;
  html?: string;
  /** e.g. the real recipient this would have gone to in production — shown for context. */
  context?: string;
};

/**
 * Central demo-mode write guard for admin-migrate. In demo mode, `guard()`
 * shows a toast and skips the real mutation entirely; `sendDemoEmail()`
 * still sends a real email, but always to the current admin's own inbox
 * (server-resolved, never client-supplied); `overlay` persists person/business
 * edits to localStorage for the session instead of writing to Supabase.
 */
export function useDemoGuard() {
  const { enabled } = useDemoModeOptional();
  const [overlayState, setOverlayState] = useState<DemoOverlay>(() => readOverlay());

  const guard = useCallback(
    async function guard<T>(realFn: () => Promise<T>, opts: DemoGuardOptions): Promise<T | undefined> {
      if (!enabled) return realFn();
      toast.success(opts.successMessage ?? `${opts.action} — demo mode, no changes saved`);
      return undefined;
    },
    [enabled],
  );

  const sendDemoEmail = useCallback(async (payload: SendDemoEmailPayload) => {
    const res = await fetch("/api/demo/send-self-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { sent?: boolean; error?: string };
    if (!res.ok || !data.sent) throw new Error(data.error ?? "Failed to send demo email");
    toast.success("Email sent to your inbox (demo mode redirect)");
    return data;
  }, []);

  const patch = useCallback((kind: DemoOverlayKind, id: string, value: Record<string, unknown>) => {
    setOverlayState(patchOverlayEntity(kind, id, value));
  }, []);

  const apply = useCallback(
    <T extends { id: string }>(kind: DemoOverlayKind, base: T): T => applyOverlay(overlayState, kind, base),
    [overlayState],
  );

  return { enabled, guard, sendDemoEmail, overlay: { patch, apply } };
}

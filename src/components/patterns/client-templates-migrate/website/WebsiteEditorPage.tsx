"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { Button } from "@/components/patterns/primitives/Button";
import { websiteApi, type EventItem, type SiteSession } from "./api";
import { EditPanel } from "./EditPanel";
import { PageMenu } from "./PageMenu";

type Active = { id: string; field?: string; nonce: number };
type FrameMessage =
  | { source: "mlcc-edit"; type: "ready"; path: string; docs: string[] }
  | { source: "mlcc-edit"; type: "open"; id: string; field?: string }
  | { source: "mlcc-edit"; type: "patch"; id: string; field: string; value: unknown };

/**
 * Admin → Edit website. The pages of the site are listed on the left; the selected page is the
 * live site rendered in edit mode. Text is typed in place; images, dates and sections open in the
 * side panel. Edits save to drafts and go live when published.
 */
export function WebsiteEditorPage() {
  const demo = useDemoModeOptional().enabled;
  const [session, setSession] = useState<SiteSession | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [framePath, setFramePath] = useState("/");
  const [currentPath, setCurrentPath] = useState("/");
  const [active, setActive] = useState<Active | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const reloadTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const siteOrigin = useMemo(() => (session ? new URL(session.siteUrl).origin : null), [session]);

  useEffect(() => {
    websiteApi.session().then(setSession).catch((e) => setSessionError(e instanceof Error ? e.message : "Could not start the editor"));
  }, []);

  const loadEvents = useCallback(() => {
    websiteApi.events().then((list) => { setEvents(list); setEventsError(null); }).catch((e) => setEventsError(e instanceof Error ? e.message : "Could not load events"));
  }, []);
  useEffect(loadEvents, [loadEvents]);

  const postToFrame = useCallback(
    (message: Record<string, unknown>) => {
      if (siteOrigin) frameRef.current?.contentWindow?.postMessage({ source: "mlcc-edit-parent", ...message }, siteOrigin);
    },
    [siteOrigin],
  );

  const reloadFrameSoon = useCallback(() => {
    clearTimeout(reloadTimer.current);
    reloadTimer.current = setTimeout(() => { postToFrame({ type: "reload" }); loadEvents(); }, 500);
  }, [postToFrame, loadEvents]);

  useEffect(() => {
    if (!siteOrigin) return;
    async function onMessage(e: MessageEvent) {
      if (e.origin !== siteOrigin || e.source !== frameRef.current?.contentWindow) return;
      const m = e.data as FrameMessage | undefined;
      if (!m || m.source !== "mlcc-edit") return;

      if (m.type === "ready") {
        setCurrentPath(m.path);
      } else if (m.type === "open") {
        setActive({ id: m.id, field: m.field, nonce: Date.now() });
      } else if (m.type === "patch") {
        if (demo) {
          toast.info("Demo mode: changes aren't saved.");
          postToFrame({ type: "reload" });
          return;
        }
        try {
          await websiteApi.save(m.id, { [m.field]: m.value });
          toast.success("Saved as a draft. Publish to make it live.");
          setRefreshKey((k) => k + 1);
          loadEvents();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Save failed");
          postToFrame({ type: "reload" });
        }
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [siteOrigin, demo, postToFrame, loadEvents]);

  const frameSrc = session ? `${session.siteUrl.replace(/\/$/, "")}${framePath}${framePath.includes("?") ? "&" : "?"}edit=${encodeURIComponent(session.token)}` : null;

  function selectPage(path: string) {
    setActive(null);
    if (path === currentPath && framePath === path) postToFrame({ type: "reload" });
    setFramePath(path);
    setCurrentPath(path);
  }

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={
          <CanvasHeader
            topbar={{
              title: "Edit website",
              endContent: session ? (
                <Button
                  label="View live site"
                  variant="ghost"
                  icon={<ExternalLink size={14} />}
                  onClick={() => window.open(`${session.siteUrl.replace(/\/$/, "")}${currentPath}`, "_blank", "noopener,noreferrer")}
                />
              ) : undefined,
            }}
          />
        }
      >
        <div style={{ display: "flex", height: "100%", minHeight: 520, color: "var(--linear-color-ink)" }}>
          <PageMenu currentPath={currentPath} events={events} eventsError={eventsError} onSelect={selectPage} />

          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "6px 12px", fontSize: 12, opacity: 0.7, borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)" }}>
              {demo ? "Demo mode: you can look around, but nothing is saved. " : ""}
              Click text to type on the page. Click images, dates and sections to edit them in the side panel.
            </div>
            {sessionError ? (
              <div style={{ padding: 24, fontSize: 13 }}>
                <strong>The editor couldn&apos;t start.</strong>
                <div style={{ marginTop: 6, opacity: 0.75 }}>{sessionError}</div>
              </div>
            ) : frameSrc ? (
              <iframe
                ref={frameRef}
                key={frameSrc}
                src={frameSrc}
                title="Website editor"
                style={{ flex: 1, width: "100%", border: 0, background: "#fff" }}
              />
            ) : (
              <div style={{ padding: 24, fontSize: 13, opacity: 0.7 }}>Starting the editor…</div>
            )}
          </div>

          {active && (
            <EditPanel
              key={active.id}
              docId={active.id}
              focusField={active.field}
              focusNonce={active.nonce}
              refreshKey={refreshKey}
              demo={demo}
              onSaved={reloadFrameSoon}
              onClose={() => setActive(null)}
            />
          )}
        </div>
      </FoundationLayout>
    </div>
  );
}

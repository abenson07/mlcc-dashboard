"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/patterns/primitives/Button";
import { DOC_TYPES, type FieldDef } from "@/lib/website/fields";
import { websiteApi, type LoadedWebsiteDoc } from "./api";
import { FieldInput } from "./FieldInput";

type Props = {
  docId: string;
  /** Field to scroll to and highlight (set when an editor clicks something on the page). */
  focusField?: string;
  /** Changes with every click on the page, so re-clicking the same field re-focuses it. */
  focusNonce: number;
  /** Bumped when the page itself saved something (inline typing), so this panel reloads. */
  refreshKey: number;
  demo: boolean;
  onSaved: () => void;
  onClose: () => void;
};

type SaveState = "idle" | "saving" | "saved" | "error";

const SAVE_DELAY_MS = 900;

export function EditPanel({ docId, focusField, focusNonce, refreshKey, demo, onSaved, onClose }: Props) {
  const [loaded, setLoaded] = useState<LoadedWebsiteDoc | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [busy, setBusy] = useState(false);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const next = await websiteApi.doc(docId);
      setLoaded(next);
      setValues(next.doc);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load");
    }
  }, [docId]);

  useEffect(() => {
    setLoaded(null);
    void load();
    const pending = timers.current;
    return () => Object.values(pending).forEach(clearTimeout);
  }, [load, refreshKey]);

  useEffect(() => {
    if (!loaded || !focusField) return;
    const el = fieldRefs.current[focusField];
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    el?.querySelector<HTMLElement>("input, textarea, select, [contenteditable], button")?.focus({ preventScroll: true });
    setFlash(focusField);
    const t = setTimeout(() => setFlash(null), 1600);
    return () => clearTimeout(t);
  }, [loaded, focusField, focusNonce]);

  function queueSave(field: FieldDef, value: unknown) {
    setValues((v) => ({ ...v, [field.name]: value }));
    if (demo) return;
    clearTimeout(timers.current[field.name]);
    timers.current[field.name] = setTimeout(async () => {
      setSaveState("saving");
      try {
        await websiteApi.save(docId, { [field.name]: value });
        setSaveState("saved");
        setLoaded((l) => (l ? { ...l, hasDraft: true } : l));
        onSaved();
      } catch (e) {
        setSaveState("error");
        toast.error(e instanceof Error ? e.message : "Save failed");
      }
    }, SAVE_DELAY_MS);
  }

  async function act(kind: "publish" | "discard") {
    if (demo) return void toast.info("Demo mode: changes aren't saved or published.");
    if (kind === "discard" && !window.confirm("Throw away your unpublished changes? The live page stays as it is.")) return;
    setBusy(true);
    try {
      Object.values(timers.current).forEach(clearTimeout);
      await (kind === "publish" ? websiteApi.publish(docId) : websiteApi.discard(docId));
      toast.success(kind === "publish" ? "Published. The live site updates within a minute." : "Changes discarded");
      await load();
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  const def = loaded ? DOC_TYPES[loaded.type] : undefined;
  const title = loaded && def ? String(values[def.titleField] ?? "") || def.label : "";

  return (
    <aside
      aria-label="Edit details"
      style={{ width: 340, flexShrink: 0, height: "100%", display: "flex", flexDirection: "column", borderLeft: "var(--linear-border-width) solid var(--linear-color-hairline)", background: "var(--linear-color-canvas)", color: "var(--linear-color-ink)" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, opacity: 0.6 }}>{def?.label ?? "Details"}</div>
          <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        </div>
        <button type="button" aria-label="Close panel" onClick={onClose} style={{ all: "unset", cursor: "pointer", padding: 4, display: "flex" }}>
          <X size={16} />
        </button>
      </div>

      {loaded && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", fontSize: 12, borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)" }}>
          <span style={{ flex: 1, opacity: 0.75 }}>
            {demo ? "Demo mode: nothing is saved" : saveState === "saving" ? "Saving…" : loaded.hasDraft ? "Unpublished changes" : loaded.published ? "Live, no changes" : "Not published yet"}
          </span>
          <Button label="Discard" variant="ghost" disabled={busy || !loaded.hasDraft} onClick={() => void act("discard")} />
          <Button label="Publish" variant="primary" disabled={busy || !loaded.hasDraft} onClick={() => void act("publish")} />
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 14 }}>
        {error && <div style={{ fontSize: 13, color: "#d64545" }}>{error}</div>}
        {!loaded && !error && <div style={{ fontSize: 13, opacity: 0.6 }}>Loading…</div>}
        {loaded &&
          def?.fields.map((field) => (
            <div
              key={field.name}
              ref={(el) => { fieldRefs.current[field.name] = el; }}
              style={{ display: "flex", flexDirection: "column", gap: 4, padding: 6, margin: -6, borderRadius: 8, background: flash === field.name ? "rgba(46,123,52,0.12)" : "transparent", transition: "background .3s" }}
            >
              {field.kind !== "boolean" && field.kind !== "text" && field.kind !== "url" && field.kind !== "textarea" && (
                <label style={{ fontSize: 12, fontWeight: 600 }}>{field.label}</label>
              )}
              <FieldInput field={field} value={values[field.name]} onChange={(next) => queueSave(field, next)} disabled={demo} />
              {field.help && <div style={{ fontSize: 11, opacity: 0.6 }}>{field.help}</div>}
            </div>
          ))}
      </div>
    </aside>
  );
}

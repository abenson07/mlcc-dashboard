"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type ReactEasyCrop from "react-easy-crop";
import type { Point } from "react-easy-crop";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import {
  EVENT_COVER_ASPECT_RATIOS,
  type EventCoverAspect,
} from "@/lib/events/eventData";
import { getCroppedImageBlob, loadImage, type CropPixels } from "@/lib/events/coverImage";

// `next/dynamic`'s inferred type loses react-easy-crop's defaultProps-based optional
// fields (rotation, minZoom, etc.), so cast back to the library's own component type.
const Cropper = dynamic(() => import("react-easy-crop"), { ssr: false }) as unknown as typeof ReactEasyCrop;

export type CoverImageCropModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  initialAspect: EventCoverAspect;
  onSave: (file: File, aspect: EventCoverAspect) => Promise<void>;
};

export function CoverImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  initialAspect,
  onSave,
}: CoverImageCropModalProps) {
  const [aspect, setAspect] = useState<EventCoverAspect>(initialAspect);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState<CropPixels | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setAspect(initialAspect);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropPixels(null);
    setLoadError(null);
    setSaveError(null);
    setBusy(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, imageSrc]);

  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    let cancelled = false;
    loadImage(imageSrc).catch(() => {
      if (!cancelled) setLoadError("This image couldn't be loaded — try a JPG or PNG.");
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  async function handleSave() {
    if (!cropPixels || !imageSrc) return;
    setBusy(true);
    setSaveError(null);
    try {
      const blob = await getCroppedImageBlob(imageSrc, cropPixels, EVENT_COVER_ASPECT_RATIOS[aspect]);
      const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
      await onSave(file, aspect);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save image");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit cover image"
      width={520}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} disabled={busy} />
          <Button
            label={busy ? "Saving…" : "Save"}
            variant="primary"
            onClick={() => void handleSave()}
            disabled={busy || !!loadError || !cropPixels}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            label="Landscape"
            variant={aspect === "landscape" ? "primary" : "secondary"}
            onClick={() => setAspect("landscape")}
          />
          <Button
            label="Portrait"
            variant={aspect === "portrait" ? "primary" : "secondary"}
            onClick={() => setAspect("portrait")}
          />
        </div>

        {loadError ? (
          <Text size="sm" color="secondary">
            {loadError}
          </Text>
        ) : (
          <>
            <div style={{ position: "relative", width: "100%", height: 360, background: "#000", borderRadius: 8, overflow: "hidden" }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={EVENT_COVER_ASPECT_RATIOS[aspect]}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCropPixels(pixels)}
              />
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </>
        )}

        {saveError ? (
          <Text size="sm" color="secondary">
            {saveError}
          </Text>
        ) : null}
      </div>
    </Modal>
  );
}

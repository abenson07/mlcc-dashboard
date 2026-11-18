"use client";

import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { OutreachImageSlot } from "./OutreachImageSlot";
import type { UploadedImage } from "./types";

/** Pick from the images already added, upload a new one, or remove the image. */
export function ChangeImageModal({
  isOpen,
  onClose,
  library,
  current,
  demo,
  onPick,
}: {
  isOpen: boolean;
  onClose: () => void;
  library: UploadedImage[];
  current?: UploadedImage | null;
  demo: boolean;
  onPick: (image: UploadedImage | null) => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change image"
      width={480}
      footer={
        <>
          {current ? (
            <Button
              label="Remove image"
              onClick={() => {
                onPick(null);
                onClose();
              }}
            />
          ) : null}
          <Button label="Done" variant="primary" onClick={onClose} />
        </>
      }
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {library.map((img) => (
          <button
            key={img.url}
            type="button"
            aria-label={`Use ${img.name}`}
            onClick={() => {
              onPick(img);
              onClose();
            }}
            style={{
              all: "unset",
              cursor: "pointer",
              width: 88,
              height: 88,
              borderRadius: 8,
              overflow: "hidden",
              boxSizing: "border-box",
              border:
                current?.url === img.url
                  ? "2px solid var(--linear-color-accent)"
                  : "var(--linear-border-width) solid var(--linear-color-hairline)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </button>
        ))}
        <OutreachImageSlot
          image={null}
          demo={demo}
          label="new image"
          onChange={(img) => {
            if (img) {
              onPick(img);
              onClose();
            }
          }}
        />
      </div>
    </Modal>
  );
}

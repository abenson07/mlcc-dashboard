"use client";

import type { ReactNode } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "primary" | "destructive";
  submitting?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  children?: ReactNode;
};

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "primary",
  submitting = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      className="max-w-md p-6"
      overlayClassName="fixed inset-0 h-full w-full bg-black/50"
    >
      <h2 className="lf-h2" style={{ fontSize: 18 }}>
        {title}
      </h2>
      {description && (
        <div className="lf-page-desc" style={{ marginTop: 8 }}>
          {description}
        </div>
      )}
      {children && <div style={{ marginTop: 16 }}>{children}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          {cancelLabel}
        </Button>
        <Button
          variant={tone === "destructive" ? "outline" : "primary"}
          className={
            tone === "destructive"
              ? "!bg-red-50 !text-red-600 !ring-1 !ring-red-200 dark:!bg-red-900/20 dark:!text-red-400"
              : undefined
          }
          disabled={submitting}
          onClick={() => onConfirm()}
        >
          {submitting ? "Working…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useQrCodes } from "hooks";
import type { QrCodes } from "@/types/database";
import { normalizeUrl } from "@/lib/qr";
import { toast } from "sonner";

interface AddQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing?: QrCodes | null;
  onSaved?: () => void;
}

export default function AddQrCodeModal({
  isOpen,
  onClose,
  editing = null,
  onSaved,
}: AddQrCodeModalProps) {
  const { create, update } = useQrCodes({ autoFetch: false });
  const isEdit = Boolean(editing?.id);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(editing?.name ?? "");
    setUrl(editing?.url ?? "");
    setError(null);
    setFormKey((k) => k + 1);
  }, [isOpen, editing]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const normalized = normalizeUrl(url);
      const payload = {
        name: name.trim() || null,
        url: normalized,
      };
      const result = isEdit && editing
        ? await update(editing.id, payload)
        : await create(payload);
      if (!result) {
        setError(isEdit ? "Failed to update QR code." : "Failed to create QR code.");
        return;
      }
      toast.success(isEdit ? "QR code updated." : "QR code created.");
      handleClose();
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid URL.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-[480px] p-5 lg:p-10"
    >
      <form key={formKey} onSubmit={handleSubmit}>
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          {isEdit ? "Edit QR code" : "New QR code"}
        </h4>

        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="space-y-5">
          <div>
            <Label>Name (optional)</Label>
            <Input
              type="text"
              placeholder="e.g. Summer social flyer"
              defaultValue={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label>URL</Label>
            <Input
              type="url"
              placeholder="https://example.com/page"
              defaultValue={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              http:// or https:// — we add https:// if omitted.
            </p>
          </div>
        </div>

        <div className="mt-6 flex w-full items-center justify-end gap-3">
          <Button size="sm" type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

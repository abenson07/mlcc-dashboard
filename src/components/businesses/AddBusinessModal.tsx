"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import { useBusinesses } from "hooks";
import type { BusinessesInsert } from "@/types/database";

const initialForm: BusinessesInsert = {
  business_name: null,
  contact_name: null,
  email: null,
  phone: null,
  address: null,
  membership_id: null,
  notes: null,
};

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function AddBusinessModal({
  isOpen,
  onClose,
  onCreated,
}: AddBusinessModalProps) {
  const { create } = useBusinesses({ autoFetch: false });
  const [form, setForm] = useState<BusinessesInsert>(initialForm);
  const [formKey, setFormKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof BusinessesInsert, value: string | null) => {
    setForm((prev) => ({ ...prev, [field]: value || null }));
    setError(null);
  };

  const reset = () => {
    setForm(initialForm);
    setError(null);
    setFormKey((k) => k + 1);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: BusinessesInsert = {
        business_name: form.business_name ?? null,
        contact_name: form.contact_name ?? null,
        email: form.email ?? null,
        phone: form.phone ?? null,
        address: form.address ?? null,
        membership_id: form.membership_id ?? null,
        notes: form.notes ?? null,
      };
      const created = await create(payload);
      if (created) {
        reset();
        onClose();
        onCreated?.();
      } else {
        setError("Failed to create business. Please try again.");
      }
    } catch {
      setError("Failed to create business. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <form key={formKey} onSubmit={handleSubmit}>
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          Add New Business
        </h4>

        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1 sm:col-span-2">
            <Label>Business Name</Label>
            <Input
              type="text"
              placeholder="Business name"
              defaultValue={form.business_name ?? ""}
              onChange={(e) => update("business_name", e.target.value)}
            />
          </div>

          <div className="col-span-1">
            <Label>Contact Name</Label>
            <Input
              type="text"
              placeholder="Contact name"
              defaultValue={form.contact_name ?? ""}
              onChange={(e) => update("contact_name", e.target.value)}
            />
          </div>

          <div className="col-span-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="email@example.com"
              defaultValue={form.email ?? ""}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          <div className="col-span-1">
            <Label>Phone</Label>
            <Input
              type="text"
              placeholder="Phone number"
              defaultValue={form.phone ?? ""}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Address</Label>
            <Input
              type="text"
              placeholder="Address"
              defaultValue={form.address ?? ""}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Notes</Label>
            <TextArea
              placeholder="Notes"
              rows={3}
              value={form.notes ?? ""}
              onChange={(value) => update("notes", value)}
            />
          </div>
        </div>

        <div className="mt-6 flex w-full items-center justify-end gap-3">
          <Button size="sm" type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Add Business"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { usePeople } from "hooks";
import type { PeopleInsert } from "@/types/database";
import { validateEmail, validatePhone } from "@/lib/validation";

const initialForm: PeopleInsert = {
  full_name: "",
  email: null,
  phone: null,
  address: null,
};

interface AddNeighborModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function AddNeighborModal({
  isOpen,
  onClose,
  onCreated,
}: AddNeighborModalProps) {
  const { create } = usePeople({ autoFetch: false });
  const [form, setForm] = useState<PeopleInsert>(initialForm);
  const [formKey, setFormKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    full_name?: string;
    email?: string;
    phone?: string;
  }>({});

  const update = (field: keyof PeopleInsert, value: string | null) => {
    setForm((prev) => ({ ...prev, [field]: value ?? (field === "full_name" ? "" : null) }));
    setError(null);
    if (field === "full_name" || field === "email" || field === "phone") {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const reset = () => {
    setForm(initialForm);
    setError(null);
    setFieldErrors({});
    setFormKey((k) => k + 1);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullNameTrimmed = (form.full_name ?? "").trim();
    if (!fullNameTrimmed) {
      setFieldErrors((prev) => ({ ...prev, full_name: "Name is required." }));
      return;
    }
    const emailError = validateEmail(form.email ?? "");
    const phoneError = validatePhone(form.phone ?? "");
    if (emailError || phoneError) {
      setFieldErrors({
        ...(emailError && { email: emailError }),
        ...(phoneError && { phone: phoneError }),
      });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    setError(null);
    try {
      const payload: PeopleInsert = {
        full_name: fullNameTrimmed,
        email: (form.email ?? "").trim() || null,
        phone: (form.phone ?? "").trim() || null,
        address: (form.address ?? "").trim() || null,
      };
      const created = await create(payload);
      if (created) {
        reset();
        onClose();
        onCreated?.();
      } else {
        setError("Failed to add neighbor. Please try again.");
      }
    } catch {
      setError("Failed to add neighbor. Please try again.");
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
          Add New Neighbor
        </h4>

        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1 sm:col-span-2">
            <Label>Full Name</Label>
            <Input
              type="text"
              placeholder="Full name"
              defaultValue={form.full_name ?? ""}
              onChange={(e) => update("full_name", e.target.value)}
              error={!!fieldErrors.full_name}
              hint={fieldErrors.full_name}
            />
          </div>

          <div className="col-span-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="email@example.com"
              defaultValue={form.email ?? ""}
              onChange={(e) => update("email", e.target.value)}
              error={!!fieldErrors.email}
              hint={fieldErrors.email}
            />
          </div>

          <div className="col-span-1">
            <Label>Phone</Label>
            <Input
              type="text"
              placeholder="Phone number"
              defaultValue={form.phone ?? ""}
              onChange={(e) => update("phone", e.target.value)}
              error={!!fieldErrors.phone}
              hint={fieldErrors.phone}
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
        </div>

        <div className="mt-6 flex w-full items-center justify-end gap-3">
          <Button size="sm" type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Add Neighbor"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

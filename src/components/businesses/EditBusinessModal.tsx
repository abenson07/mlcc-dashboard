"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import { useBusinesses } from "hooks";
import type { BusinessWithDetails } from "hooks";
import type { BusinessesUpdate } from "@/types/database";
import { validateEmail, validatePhone } from "@/lib/validation";

function toForm(item: BusinessWithDetails): BusinessesUpdate {
  return {
    business_name: item.business_name ?? null,
    contact_name: item.contact_name ?? null,
    email: item.email ?? null,
    phone: item.phone ?? null,
    address: item.address ?? null,
    notes: item.notes ?? null,
  };
}

interface EditBusinessModalProps {
  business: BusinessWithDetails | null;
  onClose: () => void;
  onSaved?: (updated: BusinessWithDetails) => void;
}

export default function EditBusinessModal({
  business,
  onClose,
  onSaved,
}: EditBusinessModalProps) {
  const { update } = useBusinesses({ autoFetch: false });
  const [form, setForm] = useState<BusinessesUpdate>(() =>
    business ? toForm(business) : {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; phone?: string }>({});

  useEffect(() => {
    if (business) setForm(toForm(business));
  }, [business]);

  const updateField = (field: keyof BusinessesUpdate, value: string | null) => {
    setForm((prev) => ({ ...prev, [field]: value || null }));
    setError(null);
    if (field === "email" || field === "phone") {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    onClose();
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

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
      const payload: BusinessesUpdate = {
        business_name: (form.business_name ?? "").toString().trim() || null,
        contact_name: (form.contact_name ?? "").toString().trim() || null,
        email: (form.email ?? "").toString().trim() || null,
        phone: (form.phone ?? "").toString().trim() || null,
        address: (form.address ?? "").toString().trim() || null,
        notes: (form.notes ?? "").toString().trim() || null,
      };
      const updated = await update(business.id, payload);
      if (updated) {
        onSaved?.({
          ...business,
          ...updated,
          sponsorships: business.sponsorships,
          membership: business.membership,
        });
        handleClose();
      } else {
        setError("Failed to save business. Please try again.");
      }
    } catch {
      setError("Failed to save business. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={business != null}
      onClose={handleClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      {business ? (
        <form onSubmit={handleSubmit}>
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Edit Business
          </h4>

          {error ? (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="col-span-1 sm:col-span-2">
              <Label>Business Name</Label>
              <Input
                type="text"
                placeholder="Business name"
                value={form.business_name ?? ""}
                onChange={(e) => updateField("business_name", e.target.value)}
              />
            </div>

            <div className="col-span-1">
              <Label>Contact Name</Label>
              <Input
                type="text"
                placeholder="Contact name"
                value={form.contact_name ?? ""}
                onChange={(e) => updateField("contact_name", e.target.value)}
              />
            </div>

            <div className="col-span-1">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={form.email ?? ""}
                onChange={(e) => updateField("email", e.target.value)}
                error={!!fieldErrors.email}
                hint={fieldErrors.email}
              />
            </div>

            <div className="col-span-1">
              <Label>Phone</Label>
              <Input
                type="text"
                placeholder="Phone number"
                value={form.phone ?? ""}
                onChange={(e) => updateField("phone", e.target.value)}
                error={!!fieldErrors.phone}
                hint={fieldErrors.phone}
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <Label>Address</Label>
              <Input
                type="text"
                placeholder="Address"
                value={form.address ?? ""}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <Label>Notes</Label>
              <TextArea
                placeholder="Notes"
                rows={3}
                value={form.notes ?? ""}
                onChange={(value) => updateField("notes", value)}
              />
            </div>
          </div>

          <div className="mt-6 flex w-full items-center justify-end gap-3">
            <Button size="sm" type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      ) : null}
    </Modal>
  );
}

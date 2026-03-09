"use client";

import React, { useState, useEffect } from "react";
import type { PersonWithMembership } from "hooks";
import type { PeopleUpdate } from "@/types/database";
import { CopyableEmail } from "@/components/common/CopyableEmail";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { usePeople } from "hooks";
import { validateEmail, validatePhone } from "@/lib/validation";

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function toForm(item: PersonWithMembership): PeopleUpdate {
  return {
    full_name: item.full_name ?? "",
    email: item.email ?? null,
    address: item.address ?? null,
    phone: item.phone ?? null,
  };
}

function isDirty(form: PeopleUpdate, item: PersonWithMembership): boolean {
  return (
    (form.full_name ?? "") !== (item.full_name ?? "") ||
    (form.email ?? null) !== (item.email ?? null) ||
    (form.address ?? null) !== (item.address ?? null) ||
    (form.phone ?? null) !== (item.phone ?? null)
  );
}

export interface NeighborDetailSidebarProps {
  item: PersonWithMembership;
  onClose?: () => void;
  onSaved?: (updated: PersonWithMembership) => void;
}

export default function NeighborDetailSidebar({ item, onSaved }: NeighborDetailSidebarProps) {
  const { update } = usePeople({ autoFetch: false });
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<PeopleUpdate>(() => toForm(item));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    full_name?: string;
    email?: string;
    phone?: string;
  }>({});

  useEffect(() => {
    setForm(toForm(item));
    setSaveError(null);
    setFieldErrors({});
  }, [item.id]);

  const dirty = isDirty(form, item);

  const handleCancel = () => {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setForm(toForm(item));
    setFieldErrors({});
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!window.confirm("Save changes?")) return;
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
    setSaveError(null);
    setSaving(true);
    try {
      const updated = await update(item.id, {
        full_name: fullNameTrimmed,
        email: (form.email ?? "").trim() || null,
        address: (form.address ?? "").trim() || null,
        phone: (form.phone ?? "").trim() || null,
      });
      if (updated) {
        setIsEditing(false);
        onSaved?.({ ...item, ...updated });
      } else {
        setSaveError("Failed to save. Please try again.");
      }
    } catch {
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof PeopleUpdate, value: string | null) => {
    setForm((prev) => ({
      ...prev,
      [field]: value ?? (field === "full_name" ? "" : null),
    }));
    setSaveError(null);
    if (field === "full_name" || field === "email" || field === "phone") {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4 text-theme-sm">
        <div>
          <Label htmlFor="neighbor-full_name">Name</Label>
          <Input
            id="neighbor-full_name"
            type="text"
            value={form.full_name ?? ""}
            onChange={(e) => updateField("full_name", e.target.value)}
            error={!!fieldErrors.full_name}
            hint={fieldErrors.full_name}
          />
        </div>
        <div>
          <Label htmlFor="neighbor-email">Email</Label>
          <Input
            id="neighbor-email"
            type="email"
            value={form.email ?? ""}
            onChange={(e) => updateField("email", e.target.value)}
            error={!!fieldErrors.email}
            hint={fieldErrors.email}
          />
        </div>
        <div>
          <Label htmlFor="neighbor-address">Address</Label>
          <Input
            id="neighbor-address"
            type="text"
            value={form.address ?? ""}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="neighbor-phone">Phone</Label>
          <Input
            id="neighbor-phone"
            type="text"
            value={form.phone ?? ""}
            onChange={(e) => updateField("phone", e.target.value)}
            error={!!fieldErrors.phone}
            hint={fieldErrors.phone}
          />
        </div>
        {saveError && (
          <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
        )}
        <div className="flex gap-2 pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <dl className="space-y-3 text-theme-sm">
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Name</dt>
          <dd className="mt-0.5 text-gray-800 dark:text-white/90">{item.full_name}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Email</dt>
          <dd className="mt-0.5">
            <CopyableEmail email={item.email} />
          </dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Address</dt>
          <dd className="mt-0.5 text-gray-800 dark:text-white/90">{item.address ?? "—"}</dd>
        </div>
        {(item.phone != null && item.phone !== "") && (
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Phone</dt>
            <dd className="mt-0.5 text-gray-800 dark:text-white/90">{item.phone}</dd>
          </div>
        )}
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Created</dt>
          <dd className="mt-0.5 text-gray-800 dark:text-white/90">{formatDate(item.created_at)}</dd>
        </div>
        {item.membership && (
          <>
            <div>
              <dt className="font-medium text-gray-500 dark:text-gray-400">Membership tier</dt>
              <dd className="mt-0.5 text-gray-800 dark:text-white/90">{item.membership.tier ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500 dark:text-gray-400">Payment method</dt>
              <dd className="mt-0.5 text-gray-800 dark:text-white/90">{item.membership.payment_method ?? "—"}</dd>
            </div>
          </>
        )}
      </dl>
      <div className="pt-2">
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
      </div>
    </div>
  );
}

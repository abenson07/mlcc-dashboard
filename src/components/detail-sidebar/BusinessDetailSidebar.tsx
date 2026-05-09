"use client";

import React, { useState, useEffect } from "react";
import type { BusinessWithDetails } from "hooks";
import type { BusinessesUpdate } from "@/types/database";
import Badge from "@/components/ui/badge/Badge";
import { CopyableEmail } from "@/components/common/CopyableEmail";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import { useBusinesses } from "hooks";

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

function isDirty(form: BusinessesUpdate, item: BusinessWithDetails): boolean {
  return (
    (form.business_name ?? null) !== (item.business_name ?? null) ||
    (form.contact_name ?? null) !== (item.contact_name ?? null) ||
    (form.email ?? null) !== (item.email ?? null) ||
    (form.phone ?? null) !== (item.phone ?? null) ||
    (form.address ?? null) !== (item.address ?? null) ||
    (form.notes ?? null) !== (item.notes ?? null)
  );
}

export interface BusinessDetailSidebarProps {
  item: BusinessWithDetails;
  onClose?: () => void;
  onSaved?: (updated: BusinessWithDetails) => void;
  /** Hide “Remove” for contexts where soft-removing a row is inappropriate (e.g. members list). */
  showRemove?: boolean;
  /** Called after the row is marked hidden and queries should refresh; typically closes the sidebar. */
  onRemoved?: () => void;
}

export default function BusinessDetailSidebar({
  item,
  onSaved,
  showRemove = true,
  onRemoved,
}: BusinessDetailSidebarProps) {
  const { update } = useBusinesses({ autoFetch: false });
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<BusinessesUpdate>(() => toForm(item));
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setForm(toForm(item));
    setSaveError(null);
  }, [item.id]);

  const dirty = isDirty(form, item);

  const handleCancel = () => {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setForm(toForm(item));
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!window.confirm("Save changes?")) return;
    setSaveError(null);
    setSaving(true);
    try {
      const updated = await update(item.id, {
        business_name: (form.business_name ?? "").toString().trim() || null,
        contact_name: (form.contact_name ?? "").toString().trim() || null,
        email: (form.email ?? "").toString().trim() || null,
        phone: (form.phone ?? "").toString().trim() || null,
        address: (form.address ?? "").toString().trim() || null,
        notes: (form.notes ?? "").toString().trim() || null,
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

  const handleRemove = async () => {
    if (
      !window.confirm(
        "Remove this business from the list? It will be hidden from the table but not deleted."
      )
    ) {
      return;
    }
    setSaveError(null);
    setRemoving(true);
    try {
      const updated = await update(item.id, { hidden: true });
      if (updated) {
        onRemoved?.();
      } else {
        setSaveError("Could not remove. Check your connection or try again.");
      }
    } catch {
      setSaveError("Could not remove. Check your connection or try again.");
    } finally {
      setRemoving(false);
    }
  };

  const updateField = <K extends keyof BusinessesUpdate>(field: K, value: BusinessesUpdate[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaveError(null);
  };

  if (isEditing) {
    return (
      <div className="space-y-4 text-theme-sm">
        <div>
          <Label htmlFor="business-business_name">Business name</Label>
          <Input
            id="business-business_name"
            type="text"
            value={form.business_name ?? ""}
            onChange={(e) => updateField("business_name", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="business-contact_name">Contact</Label>
          <Input
            id="business-contact_name"
            type="text"
            value={form.contact_name ?? ""}
            onChange={(e) => updateField("contact_name", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="business-email">Email</Label>
          <Input
            id="business-email"
            type="email"
            value={form.email ?? ""}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="business-phone">Phone</Label>
          <Input
            id="business-phone"
            type="text"
            value={form.phone ?? ""}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="business-address">Address</Label>
          <Input
            id="business-address"
            type="text"
            value={form.address ?? ""}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="business-notes">Notes</Label>
          <TextArea
            id="business-notes"
            value={form.notes ?? ""}
            onChange={(value) => updateField("notes", value)}
            rows={3}
            placeholder="Notes"
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
          <dt className="font-medium text-gray-500 dark:text-gray-400">Business name</dt>
          <dd className="mt-0.5 text-gray-800 dark:text-white/90">{item.business_name ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Contact</dt>
          <dd className="mt-0.5 text-gray-800 dark:text-white/90">{item.contact_name ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Email</dt>
          <dd className="mt-0.5">
            <CopyableEmail email={item.email} />
          </dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Phone</dt>
          <dd className="mt-0.5 text-gray-800 dark:text-white/90">{item.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Address</dt>
          <dd className="mt-0.5 text-gray-800 dark:text-white/90">{item.address ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Membership</dt>
          <dd className="mt-0.5">
            {item.membership ? (
              <Badge
                size="sm"
                color={item.membership.status === "active" ? "success" : "warning"}
              >
                {item.membership.status}
              </Badge>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">—</span>
            )}
          </dd>
        </div>
        {(item.notes != null && item.notes !== "") && (
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Notes</dt>
            <dd className="mt-0.5 text-gray-800 dark:text-white/90 whitespace-pre-wrap">{item.notes}</dd>
          </div>
        )}
      </dl>
      {saveError && (
        <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
      )}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
        {showRemove && !item.hidden && (
          <Button
            variant="outline"
            size="sm"
            disabled={removing}
            className="text-red-600 ring-red-200 hover:bg-red-50 dark:text-red-400 dark:ring-red-900/40 dark:hover:bg-red-950/30"
            onClick={() => void handleRemove()}
          >
            {removing ? "Removing…" : "Remove"}
          </Button>
        )}
      </div>
    </div>
  );
}

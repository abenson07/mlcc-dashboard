"use client";

import React, { useState, useEffect } from "react";
import type { RouteWithDeliverer } from "hooks";
import type { RoutesUpdate } from "@/types/database";
import { CopyableEmail } from "@/components/common/CopyableEmail";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useRoutes } from "hooks";

function getDelivererDisplay(route: RouteWithDeliverer): { name: string; email: string | null } | null {
  const primary = route.primary_deliverer;
  if (primary) return { name: primary.full_name, email: primary.email ?? null };
  return null;
}

function toForm(item: RouteWithDeliverer): Pick<RoutesUpdate, "route_name" | "route_type" | "leaflet_count"> {
  return {
    route_name: item.route_name ?? "",
    route_type: item.route_type ?? null,
    leaflet_count: item.leaflet_count ?? null,
  };
}

function isDirty(
  form: Pick<RoutesUpdate, "route_name" | "route_type" | "leaflet_count">,
  item: RouteWithDeliverer
): boolean {
  return (
    (form.route_name ?? "") !== (item.route_name ?? "") ||
    (form.route_type ?? null) !== (item.route_type ?? null) ||
    (form.leaflet_count ?? null) !== (item.leaflet_count ?? null)
  );
}

export interface RouteDetailSidebarProps {
  item: RouteWithDeliverer;
  onClose?: () => void;
  onSaved?: (updated: RouteWithDeliverer) => void;
}

export default function RouteDetailSidebar({ item, onSaved }: RouteDetailSidebarProps) {
  const { update } = useRoutes({ autoFetch: false });
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Pick<RoutesUpdate, "route_name" | "route_type" | "leaflet_count">>(() => toForm(item));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setForm(toForm(item));
    setSaveError(null);
  }, [item.id]);

  const dirty = isDirty(form, item);
  const deliverer = getDelivererDisplay(item);
  const covered = !!item.primary_deliverer_id;

  const handleCancel = () => {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setForm(toForm(item));
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!window.confirm("Save changes?")) return;
    const routeNameTrimmed = (form.route_name ?? "").trim();
    if (!routeNameTrimmed) {
      setSaveError("Route name is required.");
      return;
    }
    setSaveError(null);
    setSaving(true);
    try {
      const updated = await update(item.id, {
        route_name: routeNameTrimmed,
        route_type: (form.route_type ?? "").trim() || null,
        leaflet_count: form.leaflet_count,
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

  const updateField = (
    field: "route_name" | "route_type" | "leaflet_count",
    value: string | number | null
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === "leaflet_count"
        ? (value as number | null)
        : (value ?? (field === "route_name" ? "" : null)),
    }));
    setSaveError(null);
  };

  if (isEditing) {
    return (
      <div className="space-y-4 text-theme-sm">
        <div>
          <Label htmlFor="route-route_name">Route name</Label>
          <Input
            id="route-route_name"
            type="text"
            value={form.route_name ?? ""}
            onChange={(e) => updateField("route_name", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="route-route_type">Type</Label>
          <Input
            id="route-route_type"
            type="text"
            value={form.route_type ?? ""}
            onChange={(e) => updateField("route_type", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="route-leaflet_count">Leaflet count</Label>
          <Input
            id="route-leaflet_count"
            type="number"
            value={form.leaflet_count ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              updateField("leaflet_count", v === "" ? null : Number(v));
            }}
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
          <dt className="font-medium text-gray-500 dark:text-gray-400">Route name</dt>
          <dd className="mt-0.5 text-gray-800 dark:text-white/90">{item.route_name}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Type</dt>
          <dd className="mt-0.5 text-gray-800 dark:text-white/90">{item.route_type ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Leaflet count</dt>
          <dd className="mt-0.5 text-gray-800 dark:text-white/90">{item.leaflet_count ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Status</dt>
          <dd className="mt-0.5 text-gray-800 dark:text-white/90">{covered ? "Covered" : "Uncovered"}</dd>
        </div>
        {deliverer && (
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Deliverer</dt>
            <dd className="mt-0.5">
              <span className="block text-gray-800 dark:text-white/90">{deliverer.name}</span>
              {deliverer.email && (
                <span className="block text-gray-500 dark:text-gray-400">
                  <CopyableEmail email={deliverer.email} />
                </span>
              )}
            </dd>
          </div>
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

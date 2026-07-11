"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRoutes } from "hooks";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import ShellWidget from "./ShellWidget";

type ContactForm = {
  building_contact_name: string;
  building_contact_phone: string;
  building_contact_email: string;
};

export default function BuildingContactWidget() {
  const { deliveries, selectedDeliveryId, readOnly, refetchAll } = useLeafletContext();
  const { update: updateRoute } = useRoutes({ autoFetch: false });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ContactForm>({
    building_contact_name: "",
    building_contact_phone: "",
    building_contact_email: "",
  });

  const delivery =
    deliveries.find((d) => d.id === selectedDeliveryId) ?? (selectedDeliveryId ? null : deliveries[0]);
  const route = delivery?.routes;

  useEffect(() => {
    setEditing(false);
  }, [delivery?.route_id]);

  if (!delivery) return null;
  if (route?.route_type !== "Condo/apartment") return null;

  const hasContact = Boolean(
    route?.building_contact_name || route?.building_contact_phone || route?.building_contact_email,
  );

  function startEditing() {
    setForm({
      building_contact_name: route?.building_contact_name ?? "",
      building_contact_phone: route?.building_contact_phone ?? "",
      building_contact_email: route?.building_contact_email ?? "",
    });
    setEditing(true);
  }

  async function handleSave() {
    if (!delivery?.route_id) return;
    setSaving(true);
    try {
      const result = await updateRoute(delivery.route_id, {
        building_contact_name: form.building_contact_name.trim() || null,
        building_contact_phone: form.building_contact_phone.trim() || null,
        building_contact_email: form.building_contact_email.trim() || null,
      });
      if (!result) throw new Error("Update failed");
      await refetchAll();
      setEditing(false);
      toast.success("Building contact updated");
    } catch {
      toast.error("Failed to update building contact");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <ShellWidget title="Building Contact" widgetId="building-contact">
        <div className="shell-widget-detail-row">
          <span className="shell-widget-detail-label">Name</span>
          <input
            className="lf-count-input"
            style={{ width: "100%" }}
            value={form.building_contact_name}
            onChange={(e) => setForm((f) => ({ ...f, building_contact_name: e.target.value }))}
          />
        </div>
        <div className="shell-widget-detail-row">
          <span className="shell-widget-detail-label">Phone</span>
          <input
            className="lf-count-input"
            style={{ width: "100%" }}
            value={form.building_contact_phone}
            onChange={(e) => setForm((f) => ({ ...f, building_contact_phone: e.target.value }))}
          />
        </div>
        <div className="shell-widget-detail-row">
          <span className="shell-widget-detail-label">Email</span>
          <input
            className="lf-count-input"
            style={{ width: "100%" }}
            type="email"
            value={form.building_contact_email}
            onChange={(e) => setForm((f) => ({ ...f, building_contact_email: e.target.value }))}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="lf-btn lf-btn--outline"
            disabled={saving}
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
          <button type="button" className="lf-btn lf-btn--accent" disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </ShellWidget>
    );
  }

  return (
    <ShellWidget title="Building Contact" widgetId="building-contact">
      <p className="lf-meta" style={{ marginBottom: 8 }}>Building monitor who handles delivery</p>
      {hasContact ? (
        <>
          <div className="shell-widget-detail-row">
            <span className="shell-widget-detail-label">Name</span>
            <div className="shell-widget-detail-value-box">
              <span className="shell-widget-detail-value">{route?.building_contact_name ?? "—"}</span>
            </div>
          </div>
          <div className="shell-widget-detail-row">
            <span className="shell-widget-detail-label">Phone</span>
            <div className="shell-widget-detail-value-box">
              <span className="shell-widget-detail-value">{route?.building_contact_phone ?? "—"}</span>
            </div>
          </div>
          <div className="shell-widget-detail-row">
            <span className="shell-widget-detail-label">Email</span>
            <div className="shell-widget-detail-value-box">
              <span className="shell-widget-detail-value">{route?.building_contact_email ?? "—"}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="lf-empty-state">
          <p>No building contact on file</p>
        </div>
      )}
      {!readOnly && (
        <button type="button" className="lf-link" style={{ marginTop: 8 }} onClick={startEditing}>
          {hasContact ? "Edit contact" : "Add contact"}
        </button>
      )}
    </ShellWidget>
  );
}

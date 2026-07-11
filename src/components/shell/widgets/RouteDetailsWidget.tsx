"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRoutes } from "hooks";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import { evaluateCountExpression, openRoutesTableStatusLabel } from "@/components/leaflet/deliveryUtils";
import type { RouteWithPrimaryDeliverer } from "@/components/leaflet/leafletData";
import SkipRouteModal, { type CoveringPerson } from "@/components/leaflet/deliverers/SkipRouteModal";
import RemoveDelivererModal from "@/components/leaflet/deliverers/RemoveDelivererModal";
import { getApiBase } from "@/lib/apiBase";
import ShellWidget from "./ShellWidget";
import PropertyRow from "./property/PropertyRow";
import InlineEditProperty from "./property/InlineEditProperty";
import RouteTypeField from "./RouteTypeField";
import DelivererNameField, { type PickedPerson } from "./DelivererNameField";
import { IconDocument } from "./widgetIcons";

type MenuAction = "skip" | "remove" | null;

export default function RouteDetailsWidget() {
  const { leafletId, deliveries, selectedDeliveryId, updateDelivery, refetchAll, readOnly } =
    useLeafletContext();
  const { update: updateRoute } = useRoutes({ autoFetch: false });

  const [menuAction, setMenuAction] = useState<MenuAction>(null);
  const [submitting, setSubmitting] = useState(false);

  const delivery =
    deliveries.find((d) => d.id === selectedDeliveryId) ?? (selectedDeliveryId ? null : deliveries[0]);

  if (!delivery) return null;

  const route = delivery.routes as RouteWithPrimaryDeliverer | null | undefined;
  const person = delivery.people;
  const status = openRoutesTableStatusLabel(delivery);
  const coverSheetHref =
    leafletId != null
      ? `${getApiBase()}/api/leaflets/${leafletId}/deliveries/${delivery.id}/cover-sheet`
      : null;

  const deliveryId = delivery.id;
  const routeId = delivery.route_id;
  const routeLabel = route?.route_name ?? "this route";
  const previousAssignment = {
    person_id: delivery.person_id,
    is_skipped: delivery.is_skipped,
    response: delivery.response,
  };
  const previousRoute = {
    primary_deliverer_id: route?.primary_deliverer_id ?? null,
    primary_deliverer_email: route?.primary_deliverer_email ?? null,
  };

  function closeMenu() {
    setMenuAction(null);
  }

  async function handleSaveName(raw: string) {
    if (!delivery?.route_id) return;
    const trimmed = raw.trim();
    if (trimmed === "") {
      toast.error("Route name cannot be empty");
      throw new Error("validation");
    }
    const previousName = route?.route_name ?? "";
    if (trimmed === previousName) return;
    const routeId = delivery.route_id;
    try {
      const result = await updateRoute(routeId, { route_name: trimmed });
      if (!result) throw new Error("Update failed");
      await refetchAll();
      toast.success(`Route name changed to "${trimmed}"`, {
        action: {
          label: "Undo",
          onClick: () => {
            void updateRoute(routeId, { route_name: previousName }).then(() => refetchAll());
          },
        },
      });
    } catch {
      toast.error("Failed to update route name");
      throw new Error("save-failed");
    }
  }

  async function handleChangeType(newType: string) {
    if (!delivery?.route_id) return;
    const previousType = route?.route_type ?? null;
    if (newType === previousType) return;
    const routeId = delivery.route_id;
    try {
      const result = await updateRoute(routeId, { route_type: newType });
      if (!result) throw new Error("Update failed");
      await refetchAll();
      toast.success(`Route type changed to ${newType}`, {
        action: {
          label: "Undo",
          onClick: () => {
            void updateRoute(routeId, { route_type: previousType }).then(() => refetchAll());
          },
        },
      });
    } catch {
      toast.error("Failed to update route type");
    }
  }

  async function handleSaveCount(raw: string) {
    if (!delivery) return;
    const trimmed = raw.trim();
    const value = trimmed === "" ? NaN : (evaluateCountExpression(trimmed) ?? NaN);
    if (!Number.isInteger(value) || value < 0) {
      toast.error("Leaflet count must be a non-negative whole number");
      throw new Error("validation");
    }
    const previousCount = delivery.leaflet_count;
    if (value === previousCount) return;
    const deliveryId = delivery.id;
    try {
      await updateDelivery(deliveryId, { leaflet_count: value });
      toast.success(`Route count updated to ${value}`, {
        action: {
          label: "Undo",
          onClick: () => {
            void updateDelivery(deliveryId, { leaflet_count: previousCount });
          },
        },
      });
    } catch {
      toast.error("Failed to update leaflet count");
      throw new Error("save-failed");
    }
  }

  async function handleRemoveDeliverer() {
    const previous = previousAssignment;
    const prevRoute = previousRoute;
    setSubmitting(true);
    try {
      await updateDelivery(deliveryId, {
        person_id: null,
        is_skipped: false,
        response: "pending",
      });
      await updateRoute(routeId, {
        primary_deliverer_id: null,
        primary_deliverer_email: null,
      });
      closeMenu();
      toast.success("Deliverer removed", {
        action: {
          label: "Undo",
          onClick: () => {
            void updateDelivery(deliveryId, previous);
            void updateRoute(routeId, prevRoute);
          },
        },
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleChangeDeliverer(newPerson: PickedPerson) {
    const previous = previousAssignment;
    const prevRoute = previousRoute;
    setSubmitting(true);
    try {
      await updateDelivery(deliveryId, {
        person_id: newPerson.id,
        is_skipped: false,
        response: "pending",
      });
      await updateRoute(routeId, {
        primary_deliverer_id: newPerson.id,
        primary_deliverer_email: newPerson.email,
      });
      toast.success(`${newPerson.name} assigned`, {
        action: {
          label: "Undo",
          onClick: () => {
            void updateDelivery(deliveryId, previous);
            void updateRoute(routeId, prevRoute);
          },
        },
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSkip(coveringPerson: CoveringPerson | null) {
    const previous = previousAssignment;
    setSubmitting(true);
    try {
      await updateDelivery(
        deliveryId,
        coveringPerson
          ? { is_skipped: true, person_id: coveringPerson.id, response: "confirmed" }
          : { is_skipped: true, response: "needs_cover" },
      );
      closeMenu();
      toast.success(
        coveringPerson
          ? `${coveringPerson.name} is now covering ${routeLabel}`
          : `${routeLabel} marked as needing a substitute`,
        {
          action: {
            label: "Undo",
            onClick: () => {
              void updateDelivery(deliveryId, previous);
            },
          },
        },
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to skip route");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePickPerson(picked: PickedPerson) {
    void handleChangeDeliverer(picked);
  }

  return (
    <>
      <ShellWidget title="Route Details" widgetId="route-details">
        <PropertyRow label="Route name">
          <InlineEditProperty
            value={route?.route_name ?? ""}
            readOnly={readOnly}
            onSave={handleSaveName}
          />
        </PropertyRow>
        <PropertyRow label="Route type">
          <RouteTypeField
            value={route?.route_type ?? null}
            readOnly={readOnly}
            onRequestChange={handleChangeType}
          />
        </PropertyRow>
        <PropertyRow label="# of Leaflets">
          <InlineEditProperty
            value={delivery.leaflet_count != null ? String(delivery.leaflet_count) : ""}
            readOnly={readOnly}
            inputMode="numeric"
            onSave={handleSaveCount}
          />
        </PropertyRow>
        <PropertyRow label="Deliverer">
          <DelivererNameField
            personName={person?.full_name ?? null}
            hasPerson={Boolean(person)}
            readOnly={readOnly}
            excludePersonId={delivery.person_id}
            statusLabel={status}
            onPickPerson={handlePickPerson}
            onSkip={() => setMenuAction("skip")}
            onRemove={() => setMenuAction("remove")}
          />
        </PropertyRow>
        {coverSheetHref && (
          <PropertyRow label="Cover sheet">
            <a
              className="shell-widget-cover-sheet-link"
              href={coverSheetHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="shell-widget-cover-sheet-link-label">Print cover sheet</span>
              <span className="shell-widget-cover-sheet-link-icon">
                <IconDocument />
              </span>
            </a>
          </PropertyRow>
        )}
      </ShellWidget>

      {menuAction === "skip" && (
        <SkipRouteModal
          routeLabel={routeLabel}
          routeId={routeId}
          excludePersonId={delivery.person_id}
          submitting={submitting}
          onConfirm={handleSkip}
          onCancel={closeMenu}
        />
      )}

      {menuAction === "remove" && person && (
        <RemoveDelivererModal
          personName={person.full_name}
          submitting={submitting}
          onConfirm={handleRemoveDeliverer}
          onCancel={closeMenu}
        />
      )}
    </>
  );
}

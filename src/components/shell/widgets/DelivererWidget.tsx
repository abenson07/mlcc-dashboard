"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRoutes } from "hooks";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import { openRoutesTableStatusLabel } from "@/components/leaflet/deliveryUtils";
import type { RouteWithPrimaryDeliverer } from "@/components/leaflet/leafletData";
import SkipRouteModal, { type CoveringPerson } from "@/components/leaflet/deliverers/SkipRouteModal";
import RemoveDelivererModal from "@/components/leaflet/deliverers/RemoveDelivererModal";
import ShellWidget from "./ShellWidget";
import PropertyRow from "./property/PropertyRow";
import DelivererNameField, { type PickedPerson } from "./DelivererNameField";

type MenuAction = "skip" | "remove" | null;

export default function DelivererWidget() {
  const { deliveries, selectedDeliveryId, updateDelivery, readOnly } = useLeafletContext();
  const { update: updateRoute } = useRoutes({ autoFetch: false });

  const [menuAction, setMenuAction] = useState<MenuAction>(null);
  const [submitting, setSubmitting] = useState(false);

  const delivery =
    deliveries.find((d) => d.id === selectedDeliveryId) ?? (selectedDeliveryId ? null : deliveries[0]);

  if (!delivery) return null;

  const person = delivery.people;
  const route = delivery.routes as RouteWithPrimaryDeliverer | null | undefined;

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

  async function handleRemove() {
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

  async function handleChange(newPerson: PickedPerson) {
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
    void handleChange(picked);
  }

  return (
    <>
      <ShellWidget title="Deliverer" cardId="deliverer">
        <PropertyRow label="Name">
          <DelivererNameField
            personName={person?.full_name ?? null}
            hasPerson={Boolean(person)}
            readOnly={readOnly}
            excludePersonId={delivery.person_id}
            onPickPerson={handlePickPerson}
            onSkip={() => setMenuAction("skip")}
            onRemove={() => setMenuAction("remove")}
          />
        </PropertyRow>
        {person?.email && (
          <PropertyRow label="Contact email">
            <span className="shell-widget-property-static">{person.email}</span>
          </PropertyRow>
        )}
        {person?.address && (
          <PropertyRow label="Delivery address">
            <span className="shell-widget-property-static">{person.address}</span>
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
          onConfirm={handleRemove}
          onCancel={closeMenu}
        />
      )}
    </>
  );
}

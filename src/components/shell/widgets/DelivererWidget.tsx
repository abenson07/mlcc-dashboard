"use client";

import { toast } from "sonner";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import { IconMail, IconMapPin, IconUser } from "@/components/leaflet/icons";
import { openRoutesTableStatusLabel } from "@/components/leaflet/deliveryUtils";
import type { RouteWithPrimaryDeliverer } from "@/components/leaflet/leafletData";
import DelivererAssignSection from "@/components/leaflet/routes/DelivererAssignSection";
import ShellWidget from "./ShellWidget";

export default function DelivererWidget() {
  const {
    deliveries,
    selectedDeliveryId,
    updateDelivery,
    pastDeliverersForRoute,
    readOnly,
  } = useLeafletContext();

  const delivery =
    deliveries.find((d) => d.id === selectedDeliveryId) ?? (selectedDeliveryId ? null : deliveries[0]);

  if (!delivery) return null;

  const person = delivery.people;
  const status = openRoutesTableStatusLabel(delivery);
  const route = delivery.routes as RouteWithPrimaryDeliverer | null | undefined;
  const primary = route?.primary_deliverer;
  const primaryDeliverer = primary ? { id: primary.id, name: primary.full_name } : null;

  const deliveryId = delivery.id;
  async function handleAssign(personId: string) {
    await updateDelivery(deliveryId, {
      person_id: personId,
      is_skipped: false,
      response: "pending",
    });
    toast.success("Deliverer assigned");
  }

  return (
    <ShellWidget title="Deliverer" cardId="deliverer">
      {person && (
        <>
          <div className="lf-detail-icon-row">
            <span className="lf-detail-label">Name</span>
            <span className="lf-detail-icon-value">
              <IconUser />
              {person.full_name}
            </span>
          </div>
          {person.email && (
            <div className="lf-detail-icon-row">
              <span className="lf-detail-label">Contact email</span>
              <span className="lf-detail-icon-value">
                <IconMail />
                {person.email}
              </span>
            </div>
          )}
          {person.address && (
            <div className="lf-detail-icon-row">
              <span className="lf-detail-label">Delivery address</span>
              <span className="lf-detail-icon-value">
                <IconMapPin />
                {person.address}
              </span>
            </div>
          )}
        </>
      )}
      <DelivererAssignSection
        person={person}
        status={status}
        readOnly={readOnly}
        onAssign={handleAssign}
        pastDeliverers={pastDeliverersForRoute(delivery.route_id, delivery.person_id)}
        primaryDeliverer={primaryDeliverer}
        hideCurrentDeliverer={Boolean(person)}
      />
    </ShellWidget>
  );
}

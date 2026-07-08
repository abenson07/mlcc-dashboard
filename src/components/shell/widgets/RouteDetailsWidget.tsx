"use client";

import { toast } from "sonner";
import { useRoutes } from "hooks";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import { evaluateCountExpression, openRoutesTableStatusLabel } from "@/components/leaflet/deliveryUtils";
import { getApiBase } from "@/lib/apiBase";
import ShellWidget from "./ShellWidget";
import PropertyRow from "./property/PropertyRow";
import InlineEditProperty from "./property/InlineEditProperty";
import RouteTypeField from "./RouteTypeField";

function formatChange(change: number) {
  if (change > 0) return `+${change}`;
  if (change < 0) return `−${Math.abs(change)}`;
  return "+0";
}

export default function RouteDetailsWidget() {
  const { leafletId, deliveries, selectedDeliveryId, countChangeByRouteId, updateDelivery, refetchAll, readOnly } =
    useLeafletContext();
  const { update: updateRoute } = useRoutes({ autoFetch: false });

  const delivery =
    deliveries.find((d) => d.id === selectedDeliveryId) ?? (selectedDeliveryId ? null : deliveries[0]);

  if (!delivery) return null;

  const route = delivery.routes;
  const status = openRoutesTableStatusLabel(delivery);
  const countChange = countChangeByRouteId(delivery.route_id, delivery.leaflet_count);
  const coverSheetHref =
    leafletId != null
      ? `${getApiBase()}/api/leaflets/${leafletId}/deliveries/${delivery.id}/cover-sheet`
      : null;

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

  return (
    <ShellWidget title="Route Details" cardId="route-details">
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
      <PropertyRow label="Route count">
        <InlineEditProperty
          value={delivery.leaflet_count != null ? String(delivery.leaflet_count) : ""}
          readOnly={readOnly}
          inputMode="numeric"
          onSave={handleSaveCount}
        />
      </PropertyRow>
      {countChange != null && (
        <PropertyRow label="Since last delivery">
          <span
            className={`shell-widget-property-static ${countChange < 0 ? "lf-text-red" : "lf-text-green"}`}
          >
            {formatChange(countChange)}
          </span>
        </PropertyRow>
      )}
      <PropertyRow label="Status">
        <span className="shell-widget-property-static">{status}</span>
      </PropertyRow>
      {route?.special_instructions && (
        <PropertyRow label="Special instructions">
          <span className="shell-widget-property-static">{route.special_instructions}</span>
        </PropertyRow>
      )}
      {coverSheetHref && (
        <div className="shell-widget-detail-row">
          <span className="shell-widget-detail-label">Cover sheet</span>
          <a className="lf-link" href={coverSheetHref} target="_blank" rel="noopener noreferrer">
            Print cover sheet
          </a>
        </div>
      )}
    </ShellWidget>
  );
}

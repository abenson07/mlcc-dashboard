"use client";

import { useState } from "react";
import { Button } from "@/components/patterns/primitives/Button";
import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { MapPin, User } from "lucide-react";
import { toast } from "sonner";
import { useDeliveries, useDemoGuard } from "hooks";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { LeafletRouteRow } from "@/data/mocks/leaflets";
import {
  RemoveRoutesConfirmModal,
  SkipRouteConfirmModal,
} from "./LeafletRouteActionModals";
import { applyLeafletDeliveryStatus, routeHasDeliverer } from "./leafletDeliveryStatus";

export type RouteDetailPanelProps = {
  route: LeafletRouteRow;
  leafletId: string;
  demo?: boolean;
};

export function RouteDetailPanel({ route, leafletId, demo = false }: RouteDetailPanelProps) {
  const { enabled: demoGuard } = useDemoGuard();
  const isDemo = demo || demoGuard;
  const scopeKey = leafletId || "default";
  const { update, refetch } = useDeliveries(leafletId, {
    enabled: !isDemo && Boolean(leafletId),
  });
  const [skipOpen, setSkipOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isSkipped = route.status === "skipped";
  const isAssigned = route.status === "in-progress";
  const hasDeliverer = routeHasDeliverer(route);
  const alreadyConfirmed = route.response === "confirmed" && !isSkipped;
  const personLabel = route.personName
    ? isSkipped
      ? `Skipped by ${route.personName}`
      : route.personName
    : isSkipped
      ? "Needs a substitute deliverer"
      : isAssigned
        ? "Assigned"
        : "Unassigned";

  async function apply(
    action: "confirm" | "skip" | "remove",
    liveMessage: string,
    demoMessage: string,
  ) {
    await applyLeafletDeliveryStatus({
      isDemo,
      scopeKey,
      deliveryIds: [route.id],
      action,
      update,
      refetch,
    });
    toast.success(isDemo ? demoMessage : liveMessage);
  }

  async function handleConfirm() {
    try {
      await apply(
        "confirm",
        "Route confirmed",
        "Route confirmed — demo mode, saved locally only",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to confirm");
    }
  }

  async function handleSkip() {
    setSubmitting(true);
    try {
      await apply("skip", "Route skipped", "Route skipped — demo mode, saved locally only");
      setSkipOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to skip");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    setSubmitting(true);
    try {
      await apply(
        "remove",
        "Deliverer removed",
        "Route removed — demo mode, saved locally only",
      );
      setRemoveOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <VStack gap={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Text size="sm" color="secondary">
          {isSkipped ? "Skipped route" : isAssigned ? "Assigned route" : "Open route"}
        </Text>
        <Text style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>{route.name}</Text>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Route
          </Text>
        }
      >
        <SideContentField icon={<MapPin size={16} strokeWidth={1.75} />} label={route.detail} />
        <SideContentField icon={<User size={16} strokeWidth={1.75} />} label={personLabel} />
      </List>

      {hasDeliverer ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {!alreadyConfirmed ? (
            <Button
              label="Confirm deliverer"
              variant="primary"
              size="sm"
              width="100%"
              onClick={() => void handleConfirm()}
            />
          ) : null}
          <Button
            label="Skip route"
            variant="secondary"
            size="sm"
            width="100%"
            onClick={() => setSkipOpen(true)}
          />
          <Button
            label="Remove deliverer"
            variant="secondary"
            size="sm"
            width="100%"
            onClick={() => setRemoveOpen(true)}
          />
        </div>
      ) : null}

      <SkipRouteConfirmModal
        isOpen={skipOpen}
        routeLabel={route.name}
        submitting={submitting}
        onCancel={() => setSkipOpen(false)}
        onConfirm={handleSkip}
      />
      <RemoveRoutesConfirmModal
        isOpen={removeOpen}
        personName={route.personName ?? route.detail}
        submitting={submitting}
        onCancel={() => setRemoveOpen(false)}
        onConfirm={handleRemove}
      />
    </VStack>
  );
}

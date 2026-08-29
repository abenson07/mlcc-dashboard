"use client";

import { useState } from "react";
import { Mail, MapPin, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useDeliveries, useDemoGuard } from "hooks";
import { SideContentSection, SideContentField } from "@/components/patterns/foundation/side-content";
import { Text } from "@/components/patterns/primitives/Text";
import { Button } from "@/components/patterns/primitives/Button";
import { Dropdown, DropdownItem } from "@/components/patterns/shared/dropdown";
import { IconButton } from "@/components/patterns/shared/IconButton";
import type { LeafletDelivererRouteRow, LeafletDelivererRow } from "@/data/mocks/leaflets";
import {
  RemoveRoutesConfirmModal,
  SkipRouteConfirmModal,
} from "./LeafletRouteActionModals";
import {
  applyLeafletDeliveryStatus,
  deliveryIdsForDeliverer,
} from "./leafletDeliveryStatus";

export type DelivererPersonPanelProps = {
  deliverer: LeafletDelivererRow;
  leafletId: string;
  demo?: boolean;
  onEmail?: () => void;
};

export function DelivererPersonPanel({
  deliverer,
  leafletId,
  demo = false,
  onEmail,
}: DelivererPersonPanelProps) {
  const { enabled: demoGuard } = useDemoGuard();
  const isDemo = demo || demoGuard;
  const scopeKey = leafletId || "default";
  const { update, refetch } = useDeliveries(leafletId, {
    enabled: !isDemo && Boolean(leafletId),
  });
  const [skipTarget, setSkipTarget] = useState<{ label: string; deliveryIds: string[] } | null>(
    null,
  );
  const [removeTarget, setRemoveTarget] = useState<{
    personName: string;
    deliveryIds: string[];
    allRoutes: boolean;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function apply(
    ids: string[],
    action: "confirm" | "skip" | "remove",
    liveMessage: string,
    demoMessage: string,
  ) {
    await applyLeafletDeliveryStatus({
      isDemo,
      scopeKey,
      deliveryIds: ids,
      action,
      update,
      refetch,
    });
    toast.success(isDemo ? demoMessage : liveMessage);
  }

  async function handleConfirm(ids: string[], allRoutes: boolean) {
    try {
      await apply(
        ids,
        "confirm",
        allRoutes ? "Deliverer confirmed" : "Route confirmed",
        allRoutes
          ? "Deliverer confirmed — demo mode, saved locally only"
          : "Route confirmed — demo mode, saved locally only",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to confirm");
    }
  }

  async function handleSkip() {
    if (!skipTarget) return;
    setSubmitting(true);
    try {
      await apply(
        skipTarget.deliveryIds,
        "skip",
        "Route skipped",
        "Routes skipped — demo mode, saved locally only",
      );
      setSkipTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to skip");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    if (!removeTarget) return;
    setSubmitting(true);
    try {
      await apply(
        removeTarget.deliveryIds,
        "remove",
        "Deliverer removed",
        "Routes removed — demo mode, saved locally only",
      );
      setRemoveTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove");
    } finally {
      setSubmitting(false);
    }
  }

  const allIds = deliveryIdsForDeliverer(deliverer);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "8px 4px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <Text weight="semibold" size="md">
            {deliverer.name}
          </Text>
          <Text size="sm" color="secondary">
            Leaflet deliverer · {deliverer.status}
          </Text>
        </div>
        <Dropdown
          label="Deliverer actions"
          open={menuOpen}
          onOpenChange={setMenuOpen}
          placement="below"
          alignment="end"
          trigger={
            <IconButton
              label="Deliverer actions"
              variant="ghost"
              size="sm"
              icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
            />
          }
        >
          {onEmail ? (
            <DropdownItem
              label="Email this deliverer"
              onSelect={() => {
                setMenuOpen(false);
                onEmail();
              }}
            />
          ) : null}
          <DropdownItem
            label="Confirm all routes"
            onSelect={() => {
              setMenuOpen(false);
              if (allIds.length === 0) return;
              void handleConfirm(allIds, true);
            }}
          />
          <DropdownItem
            label="Skip all routes"
            onSelect={() => {
              setMenuOpen(false);
              if (allIds.length === 0) return;
              setSkipTarget({ label: `all routes for ${deliverer.name}`, deliveryIds: allIds });
            }}
          />
          <DropdownItem
            label="Remove all routes"
            onSelect={() => {
              setMenuOpen(false);
              if (allIds.length === 0) return;
              setRemoveTarget({
                personName: deliverer.name,
                deliveryIds: allIds,
                allRoutes: true,
              });
            }}
          />
        </Dropdown>
      </div>
      <SideContentSection title="Contact">
        <SideContentField
          icon={<Mail size={16} strokeWidth={1.75} />}
          label={deliverer.email || "—"}
        />
        <SideContentField
          icon={<MapPin size={16} strokeWidth={1.75} />}
          label={deliverer.address || "—"}
        />
      </SideContentSection>
      <SideContentSection title="Routes on this leaflet">
        {deliverer.routes.map((route) => (
          <DelivererRouteRow
            key={route.id}
            route={route}
            onConfirm={(row) => void handleConfirm([row.deliveryId ?? row.id], false)}
            onSkip={(row) =>
              setSkipTarget({ label: row.name, deliveryIds: [row.deliveryId ?? row.id] })
            }
            onRemove={(row) =>
              setRemoveTarget({
                personName: deliverer.name,
                deliveryIds: [row.deliveryId ?? row.id],
                allRoutes: false,
              })
            }
          />
        ))}
      </SideContentSection>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {onEmail ? (
          <Button
            label="Email this deliverer"
            variant="secondary"
            size="sm"
            width="100%"
            icon={<Mail size={14} strokeWidth={1.75} />}
            onClick={onEmail}
          />
        ) : null}
        <Button
          label="Confirm all routes"
          variant="primary"
          size="sm"
          width="100%"
          onClick={() => {
            if (allIds.length === 0) return;
            void handleConfirm(allIds, true);
          }}
        />
      </div>
      <SkipRouteConfirmModal
        isOpen={skipTarget != null}
        routeLabel={skipTarget?.label ?? ""}
        submitting={submitting}
        onCancel={() => setSkipTarget(null)}
        onConfirm={handleSkip}
      />
      <RemoveRoutesConfirmModal
        isOpen={removeTarget != null}
        personName={removeTarget?.personName ?? ""}
        allRoutes={removeTarget?.allRoutes}
        submitting={submitting}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
      />
    </div>
  );
}

function DelivererRouteRow({
  route,
  onConfirm,
  onSkip,
  onRemove,
}: {
  route: LeafletDelivererRouteRow;
  onConfirm: (route: LeafletDelivererRouteRow) => void;
  onSkip: (route: LeafletDelivererRouteRow) => void;
  onRemove: (route: LeafletDelivererRouteRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const alreadyConfirmed = route.response === "confirmed" && !route.isSkipped;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <SideContentField
          label={`${route.name} · ${route.leafletCount} leaflets${route.isSkipped ? " · skipped" : ""}`}
        />
      </div>
      <Dropdown
        label={`Actions for ${route.name}`}
        open={open}
        onOpenChange={setOpen}
        placement="below"
        alignment="end"
        trigger={
          <IconButton
            label={`Actions for ${route.name}`}
            variant="ghost"
            size="sm"
            icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
          />
        }
      >
        {!alreadyConfirmed ? (
          <DropdownItem
            label="Confirm route"
            onSelect={() => {
              setOpen(false);
              onConfirm(route);
            }}
          />
        ) : null}
        <DropdownItem
          label="Skip route"
          onSelect={() => {
            setOpen(false);
            onSkip(route);
          }}
        />
        <DropdownItem
          label="Remove route"
          onSelect={() => {
            setOpen(false);
            onRemove(route);
          }}
        />
      </Dropdown>
    </div>
  );
}

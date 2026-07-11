"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import type { DeliveryWithRelations } from "hooks";
import { IconCopy, IconMapPin, IconSearch } from "../icons";
import { useLeafletContext } from "../LeafletContext";
import type { DelivererCard } from "../types";
import AddRoutePicker from "./AddRoutePicker";
import SkipRouteModal, { type CoveringPerson } from "./SkipRouteModal";

type SkipTarget = {
  deliveryIds: string[];
  routeLabel: string;
  routeId?: string | null;
  excludePersonId?: string | null;
};

export default function DeliverersPageContent() {
  const { delivererCards, deliveries, updateDelivery, readOnly } = useLeafletContext();
  const [search, setSearch] = useState("");
  const [skipTarget, setSkipTarget] = useState<SkipTarget | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [addRouteOpenId, setAddRouteOpenId] = useState<string | null>(null);

  const openDeliveries = useMemo(
    () => deliveries.filter((d) => !d.person_id || d.is_skipped),
    [deliveries],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return delivererCards;
    return delivererCards.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.routes.some((r) => r.name.toLowerCase().includes(q)),
    );
  }, [delivererCards, search]);

  async function handleCopy(card: DelivererCard) {
    const text = [card.name, card.address ?? "", card.routes.map((r) => r.name).join(", ")]
      .filter(Boolean)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }

  function openSkipCardModal(card: DelivererCard) {
    const deliveryIds = card.routes.filter((r) => r.deliveryId).map((r) => r.deliveryId as string);
    if (deliveryIds.length === 0) return;
    setSkipTarget({
      deliveryIds,
      routeLabel: `all routes for ${card.name}`,
      routeId: null,
      excludePersonId: card.id,
    });
  }

  function openSkipRouteModal(card: DelivererCard, route: DelivererCard["routes"][number]) {
    if (!route.deliveryId) return;
    setSkipTarget({
      deliveryIds: [route.deliveryId],
      routeLabel: route.name,
      routeId: route.routeId ?? null,
      excludePersonId: card.id,
    });
  }

  async function handleAssignRoute(card: DelivererCard, delivery: DeliveryWithRelations) {
    const previous = {
      person_id: delivery.person_id,
      is_skipped: delivery.is_skipped,
      response: delivery.response,
    };
    setAddRouteOpenId(null);
    await updateDelivery(delivery.id, {
      person_id: card.id,
      is_skipped: false,
      response: "pending",
    });
    toast.success(`${delivery.routes?.route_name ?? "Route"} assigned to ${card.name}`, {
      action: {
        label: "Undo",
        onClick: () => {
          void updateDelivery(delivery.id, previous);
        },
      },
    });
  }

  async function handleConfirmSkip(coveringPerson: CoveringPerson | null) {
    if (!skipTarget) return;
    setSubmitting(true);
    try {
      const previous = skipTarget.deliveryIds.map((id) => {
        const row = deliveries.find((d) => d.id === id);
        return {
          deliveryId: id,
          person_id: row?.person_id ?? null,
          response: row?.response ?? "pending",
          is_skipped: row?.is_skipped ?? false,
        };
      });

      await Promise.all(
        skipTarget.deliveryIds.map((id) =>
          updateDelivery(
            id,
            coveringPerson
              ? { is_skipped: true, person_id: coveringPerson.id, response: "confirmed" }
              : { is_skipped: true, response: "needs_cover" },
          ),
        ),
      );

      const { routeLabel } = skipTarget;
      setSkipTarget(null);

      toast.success(
        coveringPerson
          ? `${coveringPerson.name} is now covering ${routeLabel}`
          : `${routeLabel} marked as needing a substitute`,
        {
          action: {
            label: "Undo",
            onClick: () => {
              void Promise.all(
                previous.map((p) =>
                  updateDelivery(p.deliveryId, {
                    is_skipped: p.is_skipped,
                    person_id: p.person_id,
                    response: p.response,
                  }),
                ),
              )
                .then(() => toast.success("Undone"))
                .catch((err) =>
                  toast.error(err instanceof Error ? err.message : "Failed to undo"),
                );
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

  return (
    <div className="lf-page-layout">
      <div>
        <h1 className="lf-h2">Deliverers</h1>
        <p className="lf-page-desc">
          Manage deliverer assignments and outbound communication for this leaflet.
        </p>
      </div>

      <label className="lf-search" style={{ width: "100%", maxWidth: 360 }}>
        <IconSearch />
        <input
          type="search"
          placeholder="Search deliverers or routes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((card) => {
          const totalLeaflets = card.routes.reduce((sum, r) => sum + (r.leafletCount ?? 0), 0);
          return (
          <article key={card.id} className="lf-deliverer-card">
            <div className="lf-deliverer-header">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="lf-deliverer-name">{card.name}</span>
                  <button
                    type="button"
                    className="lf-copy-btn"
                    onClick={() => handleCopy(card)}
                    aria-label={`Copy ${card.name}'s details`}
                    title="Copy name, address and routes"
                  >
                    <IconCopy />
                  </button>
                </div>
                <div className="lf-deliverer-address">
                  <IconMapPin />
                  {card.address ?? "No address on file"}
                </div>
              </div>
              <div className="lf-card-actions lf-card-status-slot">
                <button
                  type="button"
                  className="lf-small-btn lf-card-skip-btn"
                  disabled={readOnly}
                  onClick={() => openSkipCardModal(card)}
                  title="Skip all routes for this deliverer"
                >
                  <ArrowLeftRight size={13} />
                  Skip route
                </button>
                <span
                  className={
                    card.status === "Confirmed"
                      ? "lf-status-badge lf-status-badge--green lf-card-status-badge"
                      : "lf-status-badge lf-status-badge--amber lf-card-status-badge"
                  }
                >
                  {card.status}
                </span>
              </div>
            </div>
            <table className="lf-mini-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th style={{ textAlign: "right" }}>Leaflets ({totalLeaflets.toLocaleString()})</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {card.routes.map((route) => (
                  <tr key={route.name} className={route.isSkipped ? "muted" : undefined}>
                    <td style={{ fontWeight: 500, color: route.isSkipped ? "var(--lf-text-subtle)" : undefined }}>
                      {route.name}
                    </td>
                    <td className="lf-meta" style={{ textAlign: "right" }}>{route.households}</td>
                    <td style={{ textAlign: "right" }}>
                      {route.deliveryId && (
                        <button
                          type="button"
                          className="lf-icon-btn lf-row-skip-btn"
                          disabled={readOnly || route.isSkipped}
                          onClick={() => openSkipRouteModal(card, route)}
                          aria-label={`Skip ${route.name}`}
                          title="Skip this route"
                        >
                          <ArrowLeftRight size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="lf-add-route-anchor">
              <button
                type="button"
                className="lf-add-route-link lf-add-route-row"
                disabled={readOnly}
                onClick={() =>
                  setAddRouteOpenId((cur) => (cur === card.id ? null : card.id))
                }
              >
                + Add route
              </button>
              {addRouteOpenId === card.id && (
                <>
                  <div
                    className="lf-selector-backdrop"
                    onClick={() => setAddRouteOpenId(null)}
                  />
                  <div className="lf-selector-menu" style={{ top: "100%", marginTop: 4 }}>
                    <AddRoutePicker
                      openDeliveries={openDeliveries}
                      onSelect={(delivery) => handleAssignRoute(card, delivery)}
                      onCancel={() => setAddRouteOpenId(null)}
                    />
                  </div>
                </>
              )}
            </div>
          </article>
          );
        })}
      </div>

      {skipTarget && (
        <SkipRouteModal
          routeLabel={skipTarget.routeLabel}
          routeId={skipTarget.routeId}
          excludePersonId={skipTarget.excludePersonId}
          submitting={submitting}
          onConfirm={handleConfirmSkip}
          onCancel={() => setSkipTarget(null)}
        />
      )}
    </div>
  );
}

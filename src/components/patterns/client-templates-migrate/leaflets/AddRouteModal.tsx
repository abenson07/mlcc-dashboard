"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { saveErrorMessage } from "@/lib/saveErrorMessage";
import type { LeafletRouteRow } from "@/data/mocks/leaflets";
import type { AssignDelivererPerson, AssignDelivererScope } from "./leafletDeliveryStatus";
import { AssignScopeConfirmModal } from "./LeafletRouteActionModals";
import { routeAssignmentCandidates } from "./routeAssignmentCandidates";

export type AddRouteModalProps = {
  deliverer: AssignDelivererPerson;
  routes: LeafletRouteRow[];
  loading?: boolean;
  loadError?: string | null;
  onClose: () => void;
  onAssign: (route: LeafletRouteRow, scope: AssignDelivererScope) => Promise<void>;
};

export function AddRouteModal({
  deliverer,
  routes,
  loading = false,
  loadError,
  onClose,
  onAssign,
}: AddRouteModalProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const selected = routes.find((route) => route.id === selectedId);
  const candidates = routeAssignmentCandidates(routes, deliverer.id, search);

  async function assign(scope: AssignDelivererScope) {
    if (!selected || busy.current) return;
    busy.current = true;
    setSubmitting(true);
    setError(null);
    try {
      await onAssign(selected, scope);
      onClose();
    } catch (e) {
      setError(saveErrorMessage(e, { fallback: "Couldn't assign the route. Please try again." }));
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  if (selected) {
    return (
      <AssignScopeConfirmModal
        isOpen
        personName={deliverer.name}
        routeLabel={selected.name}
        previousDelivererName={selected.personId ? selected.personName ?? "another deliverer" : null}
        submitting={submitting}
        error={error}
        onCancel={() => {
          if (busy.current) return;
          setSelectedId(null);
          setError(null);
        }}
        onThisRouteOnly={() => assign("this-route")}
        onPermanent={() => assign("permanent")}
      />
    );
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Add route for ${deliverer.name}`}
      width={420}
      footer={<Button label="Cancel" variant="ghost" onClick={onClose} />}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <TextInput label="Search all routes" value={search} onChange={setSearch} autoFocus />
        <Text size="sm" color="secondary">
          Showing open routes. Search to include routes assigned to other deliverers.
        </Text>
        {loadError ? (
          <div role="alert"><Text size="sm" color="accent">{loadError}</Text></div>
        ) : loading ? (
          <Text size="sm" color="secondary">Loading routes…</Text>
        ) : candidates.length === 0 ? (
          <Text size="sm" color="secondary">
            {search.trim() ? "No matching routes." : "No open routes. Search to reassign an existing route."}
          </Text>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 320, overflowY: "auto" }}>
            {candidates.map((route) => (
              <button
                key={route.id}
                type="button"
                onClick={() => setSelectedId(route.id)}
                style={{
                  boxSizing: "border-box",
                  cursor: "pointer",
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                  background: "var(--linear-color-canvas)",
                  color: "var(--linear-color-ink)",
                  fontFamily: "inherit",
                  fontSize: 13,
                  textAlign: "left",
                }}
              >
                {route.name}
                <span style={{ display: "block", color: "var(--linear-color-ink-subtle)", fontSize: 12 }}>
                  {route.personId
                    ? `Assigned to ${route.personName ?? "another deliverer"}${route.status === "skipped" ? " · needs cover" : ""}`
                    : "Open route"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

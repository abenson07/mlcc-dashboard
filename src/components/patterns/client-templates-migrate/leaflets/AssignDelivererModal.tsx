"use client";

import { useEffect, useMemo, useState } from "react";
import { usePeople } from "hooks";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { sampleDeliverers, type LeafletRouteRow } from "@/data/mocks/leaflets";
import type { AssignDelivererPerson, AssignDelivererScope } from "./leafletDeliveryStatus";
import { AssignScopeConfirmModal } from "./LeafletRouteActionModals";

const MAX_RESULTS = 8;

export type AssignDelivererModalProps = {
  isOpen: boolean;
  title?: string;
  routeLabel: string;
  excludePersonId?: string | null;
  demo?: boolean;
  onClose: () => void;
  onSelect: (person: AssignDelivererPerson) => void;
};

export function AssignDelivererModal({
  isOpen,
  title = "Assign deliverer",
  routeLabel,
  excludePersonId = null,
  demo = false,
  onClose,
  onSelect,
}: AssignDelivererModalProps) {
  const [search, setSearch] = useState("");
  const trimmed = search.trim();

  const { people, loading } = usePeople({
    autoFetch: isOpen && !demo && trimmed.length > 0,
    filters: { search: trimmed || undefined },
  });

  useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  const candidates = useMemo((): AssignDelivererPerson[] => {
    const source: AssignDelivererPerson[] = demo
      ? sampleDeliverers.map((d) => ({ id: d.id, name: d.name, email: d.email }))
      : people.map((p) => ({ id: p.id, name: p.full_name, email: p.email }));
    const q = trimmed.toLowerCase();
    return source
      .filter((p) => p.id !== excludePersonId)
      .filter((p) => {
        if (!q) return false;
        return (
          p.name.toLowerCase().includes(q) || (p.email ?? "").toLowerCase().includes(q)
        );
      })
      .slice(0, MAX_RESULTS);
  }, [demo, excludePersonId, people, trimmed]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={420}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button label="Cancel" variant="ghost" onClick={onClose} />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Text size="sm" color="secondary">
          Choose a deliverer for{" "}
          <span style={{ color: "var(--linear-color-ink)", fontWeight: 500 }}>{routeLabel}</span>.
        </Text>
        <TextInput label="Search people" value={search} onChange={setSearch} />
        {loading && !demo ? (
          <Text size="sm" color="secondary">
            Searching…
          </Text>
        ) : null}
        {trimmed.length === 0 ? (
          <Text size="sm" color="secondary">
            Type a name or email to search.
          </Text>
        ) : candidates.length === 0 && !loading ? (
          <Text size="sm" color="secondary">
            No matching people.
          </Text>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {candidates.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => onSelect(person)}
                style={{
                  all: "unset",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                  color: "var(--linear-color-ink)",
                  fontSize: 13,
                }}
              >
                {person.name}
                {person.email ? (
                  <span style={{ color: "var(--linear-color-ink-subtle)" }}> · {person.email}</span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export type AssignDelivererTarget = {
  row: LeafletRouteRow;
  mode: "assign" | "change";
};

export type AssignDelivererFlowProps = {
  target: AssignDelivererTarget | null;
  demo?: boolean;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (person: AssignDelivererPerson, scope: AssignDelivererScope) => Promise<void>;
};

export function AssignDelivererFlow({
  target,
  demo = false,
  submitting = false,
  onClose,
  onConfirm,
}: AssignDelivererFlowProps) {
  const [pendingPerson, setPendingPerson] = useState<AssignDelivererPerson | null>(null);

  useEffect(() => {
    if (!target) setPendingPerson(null);
  }, [target]);

  const row = target?.row ?? null;
  const pickerOpen = target != null && pendingPerson == null;
  const scopeOpen = target != null && pendingPerson != null;

  return (
    <>
      <AssignDelivererModal
        isOpen={pickerOpen}
        title={target?.mode === "change" ? "Change deliverer" : "Assign deliverer"}
        routeLabel={row?.name ?? ""}
        excludePersonId={row?.personId ?? null}
        demo={demo}
        onClose={onClose}
        onSelect={setPendingPerson}
      />
      <AssignScopeConfirmModal
        isOpen={scopeOpen}
        personName={pendingPerson?.name ?? ""}
        routeLabel={row?.name ?? ""}
        submitting={submitting}
        onCancel={() => setPendingPerson(null)}
        onThisRouteOnly={() => {
          if (!pendingPerson) return;
          void onConfirm(pendingPerson, "this-route");
        }}
        onPermanent={() => {
          if (!pendingPerson) return;
          void onConfirm(pendingPerson, "permanent");
        }}
      />
    </>
  );
}

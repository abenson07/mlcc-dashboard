"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useDemoGuard, usePeople } from "hooks";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import type { LeafletRouteRow } from "@/data/mocks/leaflets";
import { DUPLICATE_PERSON_EMAIL, saveErrorMessage } from "@/lib/saveErrorMessage";
import {
  createDelivererPerson,
  demoDelivererPeople,
  type NewDelivererInput,
} from "./delivererPeople";
import type { AssignDelivererPerson, AssignDelivererScope } from "./leafletDeliveryStatus";
import { AssignScopeConfirmModal } from "./LeafletRouteActionModals";

const MAX_RESULTS = 24;

export type AssignDelivererModalProps = {
  isOpen: boolean;
  title?: string;
  routeLabel: string;
  excludePersonId?: string | null;
  demo?: boolean;
  onClose: () => void;
  onSelect: (person: AssignDelivererPerson) => void;
};

function PersonPickRow({
  person,
  onSelect,
}: {
  person: AssignDelivererPerson;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        boxSizing: "border-box",
        appearance: "none",
        background: "transparent",
        border: "none",
        margin: 0,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 2,
        width: "100%",
        padding: "10px 12px",
        borderRadius: 6,
        color: "var(--linear-color-ink)",
        fontFamily: "inherit",
        textAlign: "left",
        lineHeight: 1.4,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "var(--linear-color-sidebar-item-selected)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "transparent";
      }}
    >
      <span
        style={{
          display: "block",
          width: "100%",
          fontSize: 13,
          fontWeight: 510,
          lineHeight: "20px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {person.name}
      </span>
      {person.email ? (
        <span
          style={{
            display: "block",
            width: "100%",
            fontSize: 12,
            lineHeight: "16px",
            color: "var(--linear-color-ink-subtle)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {person.email}
        </span>
      ) : null}
    </button>
  );
}

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
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<NewDelivererInput>({
    name: "",
    email: "",
    address: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const { enabled: demoGuard } = useDemoGuard();
  const isDemo = demo || demoGuard;
  const trimmed = search.trim();

  const { people, loading, error: peopleError, create } = usePeople({
    autoFetch: !isDemo && isOpen,
  });

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setCreating(false);
      setError(null);
      setDraft({ name: "", email: "", address: "", phone: "" });
    }
  }, [isOpen]);

  const source: AssignDelivererPerson[] = (isDemo ? demoDelivererPeople() : people).map(
    (p) => ({ id: p.id, name: p.full_name, email: p.email }),
  );
  const q = trimmed.toLowerCase();
  const candidates = source
    .filter((p) => p.id !== excludePersonId)
    .filter(
      (p) => !q || p.name.toLowerCase().includes(q) || (p.email ?? "").toLowerCase().includes(q),
    )
    .slice(0, MAX_RESULTS);

  async function handleCreate() {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      const person = await createDelivererPerson(draft, { demo: isDemo, create });
      toast.success(
        isDemo ? "Deliverer created — demo mode, saved locally only" : "Deliverer created",
      );
      onSelect({ id: person.id, name: person.full_name, email: person.email });
    } catch (e) {
      setError(
        saveErrorMessage(e, {
          fallback: "Couldn't create deliverer. Please try again.",
          duplicate: DUPLICATE_PERSON_EMAIL,
        }),
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function close() {
    if (!savingRef.current) onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={creating ? "Create new deliverer" : title}
      width={420}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button
            label={creating ? "Back" : "Cancel"}
            variant="ghost"
            disabled={saving}
            onClick={creating ? () => { setCreating(false); setError(null); } : close}
          />
          {creating ? (
            <Button
              label={saving ? "Creating…" : "Create deliverer"}
              variant="primary"
              disabled={saving}
              onClick={() => void handleCreate()}
            />
          ) : null}
        </div>
      }
    >
      {creating ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Text size="sm" color="secondary">
            Create a person, then choose how to assign them. No email will be sent.
          </Text>
          <fieldset
            disabled={saving}
            style={{ border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}
          >
            <TextInput
              label="Name (required)"
              value={draft.name}
              onChange={(name) => setDraft((prev) => ({ ...prev, name }))}
              autoFocus
            />
            <TextInput
              label="Email (required)"
              value={draft.email}
              onChange={(email) => setDraft((prev) => ({ ...prev, email }))}
            />
            <TextInput
              label="Address (optional)"
              value={draft.address}
              onChange={(address) => setDraft((prev) => ({ ...prev, address }))}
            />
            <TextInput
              label="Phone (optional)"
              value={draft.phone}
              onChange={(phone) => setDraft((prev) => ({ ...prev, phone }))}
            />
          </fieldset>
          {error ? <div role="alert"><Text size="sm" color="accent">{error}</Text></div> : null}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Text size="sm" color="secondary">
            Choose a deliverer for{" "}
            <span style={{ color: "var(--linear-color-ink)", fontWeight: 500 }}>{routeLabel}</span>.
          </Text>
          <TextInput
            label="Search people"
            value={search}
            onChange={setSearch}
            autoFocus
            placeholder="Name or email"
          />
          <Button
            label="Create new deliverer"
            icon={<Plus size={14} />}
            onClick={() => setCreating(true)}
          />
          {peopleError && !isDemo ? (
            <div role="alert"><Text size="sm" color="accent">{peopleError}</Text></div>
          ) : loading && !isDemo && people.length === 0 ? (
            <Text size="sm" color="secondary">
              Loading people…
            </Text>
          ) : candidates.length === 0 && !loading ? (
            <Text size="sm" color="secondary">
              No matching people.
            </Text>
          ) : (
            <div
              role="listbox"
              aria-label="People"
              style={{
                display: "flex",
                flexDirection: "column",
                maxHeight: 280,
                overflow: "auto",
                padding: 4,
                borderRadius: 8,
                border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                background: "var(--linear-color-canvas)",
              }}
            >
              {candidates.map((person) => (
                <PersonPickRow
                  key={person.id}
                  person={person}
                  onSelect={() => onSelect(person)}
                />
              ))}
            </div>
          )}
        </div>
      )}
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

"use client";

import { useState } from "react";
import type { People } from "@/types/database";
import { IconMail } from "../icons";
import DelivererPicker from "./DelivererPicker";

type PastDeliverer = { id: string; name: string };

type DelivererAssignSectionProps = {
  person: People | null | undefined;
  status: string;
  readOnly?: boolean;
  onAssign?: (personId: string) => Promise<void>;
  onEmailPastDeliverer?: (personId: string) => Promise<void>;
  emailingPersonId?: string | null;
  pastDeliverers?: PastDeliverer[];
  primaryDeliverer?: PastDeliverer | null;
  compact?: boolean;
  hideCurrentDeliverer?: boolean;
};

export default function DelivererAssignSection({
  person,
  status,
  readOnly = false,
  onAssign,
  onEmailPastDeliverer,
  emailingPersonId = null,
  pastDeliverers = [],
  primaryDeliverer = null,
  compact = false,
  hideCurrentDeliverer = false,
}: DelivererAssignSectionProps) {
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [pendingChange, setPendingChange] = useState<PastDeliverer | null>(null);

  const canAssign = Boolean(onAssign) && !readOnly;
  const showPrimary =
    primaryDeliverer &&
    primaryDeliverer.id !== person?.id &&
    !pastDeliverers.some((p) => p.id === primaryDeliverer.id);

  async function handleAssign(personId: string) {
    if (!onAssign || readOnly) return;
    setAssigningId(personId);
    try {
      await onAssign(personId);
      setPicking(false);
      setPendingChange(null);
    } finally {
      setAssigningId(null);
    }
  }

  function requestAssign(next: PastDeliverer) {
    if (!canAssign || next.id === person?.id) return;
    if (person) {
      setPendingChange(next);
      setPicking(false);
      return;
    }
    void handleAssign(next.id);
  }

  function cancelPendingChange() {
    setPendingChange(null);
  }

  if (!canAssign && !person) {
    return (
      <div className="lf-empty-state">
        <p>No deliverer assigned</p>
      </div>
    );
  }

  if (pendingChange && person) {
    return (
      <div className="lf-deliverer-change-confirm">
        <p>
          Replace <strong>{person.full_name}</strong> with{" "}
          <strong>{pendingChange.name}</strong>?
        </p>
        <div className="lf-deliverer-change-confirm-actions">
          <button
            type="button"
            className="lf-btn lf-btn--outline"
            disabled={assigningId != null}
            onClick={cancelPendingChange}
          >
            Cancel
          </button>
          <button
            type="button"
            className="lf-btn lf-btn--accent"
            disabled={assigningId != null}
            onClick={() => void handleAssign(pendingChange.id)}
          >
            {assigningId != null ? "Changing…" : "Confirm change"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {person && !picking && !hideCurrentDeliverer ? (
        <div className="lf-detail-row">
          <span>{person.full_name}</span>
          <span className="lf-meta">{status}</span>
        </div>
      ) : null}

      {!person && !picking ? (
        <div className="lf-empty-state">
          <p>No deliverer assigned</p>
          {canAssign && (
            <>
              {pastDeliverers.length > 0 && (
                <button
                  type="button"
                  className="lf-btn lf-btn--accent"
                  disabled={assigningId != null}
                  onClick={() => requestAssign(pastDeliverers[0]!)}
                >
                  {assigningId ? "Assigning…" : `Assign ${pastDeliverers[0]!.name}`}
                </button>
              )}
              {showPrimary && (
                <button
                  type="button"
                  className="lf-btn lf-btn--outline"
                  disabled={assigningId != null}
                  onClick={() => requestAssign(primaryDeliverer!)}
                >
                  {assigningId === primaryDeliverer!.id
                    ? "Assigning…"
                    : `Assign ${primaryDeliverer!.name}`}
                </button>
              )}
              <button
                type="button"
                className="lf-btn lf-btn--accent"
                disabled={assigningId != null}
                onClick={() => setPicking(true)}
              >
                Add deliverer
              </button>
            </>
          )}
        </div>
      ) : null}

      {canAssign && picking && (
        <DelivererPicker
          excludePersonId={person?.id}
          selecting={assigningId != null}
          onSelect={requestAssign}
          onCancel={() => setPicking(false)}
        />
      )}

      {canAssign && person && !picking && (
        <div style={{ marginTop: person ? 8 : 0 }}>
          <button
            type="button"
            className="lf-btn lf-btn--outline"
            style={{ width: compact ? "100%" : undefined }}
            disabled={assigningId != null}
            onClick={() => setPicking(true)}
          >
            Change deliverer
          </button>
        </div>
      )}

      {!compact && (pastDeliverers.length > 0 || showPrimary) && !picking && (
        <>
          <div style={{ height: 1, background: "var(--lf-bg)", margin: "12px 0" }} />
          <p className="lf-meta" style={{ fontWeight: 600, marginBottom: 8 }}>
            {person ? "Other deliverers" : "Past deliverers"}
          </p>
          {showPrimary && (
            <div className="lf-detail-row">
              <span>
                {primaryDeliverer!.name}
                <span className="lf-meta"> · Primary</span>
              </span>
              <button
                type="button"
                className="lf-link"
                style={{ border: "none", background: "none", padding: 0 }}
                disabled={assigningId === primaryDeliverer!.id}
                onClick={() => requestAssign(primaryDeliverer!)}
              >
                {assigningId === primaryDeliverer!.id ? "Assigning…" : "Assign"}
              </button>
            </div>
          )}
          {pastDeliverers.map((p) => (
            <div key={p.id} className="lf-detail-row">
              <span>{p.name}</span>
              <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {onEmailPastDeliverer && (
                  <button
                    type="button"
                    className="lf-link"
                    style={{
                      border: "none",
                      background: "none",
                      padding: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    disabled={emailingPersonId === p.id}
                    onClick={() => onEmailPastDeliverer(p.id)}
                    title="Email past deliverer"
                  >
                    <IconMail />
                    {emailingPersonId === p.id ? "Sending…" : "Email"}
                  </button>
                )}
                <button
                  type="button"
                  className="lf-link"
                  style={{ border: "none", background: "none", padding: 0 }}
                  disabled={assigningId === p.id || person?.id === p.id}
                  onClick={() => requestAssign(p)}
                >
                  {assigningId === p.id ? "Assigning…" : person?.id === p.id ? "Assigned" : "Assign"}
                </button>
              </span>
            </div>
          ))}
        </>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import type { People } from "@/types/database";
import { IconMail } from "../icons";
import DelivererPicker from "./DelivererPicker";
import {
  destructiveBtnStyle,
  linkBtnStyle,
  outlineBtnStyle,
  primaryBtnStyle,
} from "../deliverers/actionButtonStyles";

type PastDeliverer = { id: string; name: string };

type DelivererAssignSectionProps = {
  person: People | null | undefined;
  status: string;
  readOnly?: boolean;
  onAssign?: (personId: string) => Promise<void>;
  onRemove?: () => Promise<void>;
  onEmailPastDeliverer?: (personId: string) => Promise<void>;
  emailingPersonId?: string | null;
  pastDeliverers?: PastDeliverer[];
  primaryDeliverer?: PastDeliverer | null;
  compact?: boolean;
  hideCurrentDeliverer?: boolean;
  hideChangeRemoveActions?: boolean;
};

export default function DelivererAssignSection({
  person,
  status,
  readOnly = false,
  onAssign,
  onRemove,
  onEmailPastDeliverer,
  emailingPersonId = null,
  pastDeliverers = [],
  primaryDeliverer = null,
  compact = false,
  hideCurrentDeliverer = false,
  hideChangeRemoveActions = false,
}: DelivererAssignSectionProps) {
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [pendingChange, setPendingChange] = useState<PastDeliverer | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  const canAssign = Boolean(onAssign) && !readOnly;
  const canRemove = Boolean(onRemove) && !readOnly;
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
    setPendingChange(next);
    setPicking(false);
  }

  function cancelPendingChange() {
    setPendingChange(null);
  }

  async function handleRemove() {
    if (!onRemove || readOnly) return;
    setRemoving(true);
    try {
      await onRemove();
      setConfirmingRemove(false);
    } finally {
      setRemoving(false);
    }
  }

  if (!canAssign && !person) {
    return (
      <div className="lf-empty-state">
        <p>No deliverer assigned</p>
      </div>
    );
  }

  if (pendingChange) {
    return (
      <div className="lf-deliverer-change-confirm">
        <p>
          {person ? (
            <>
              Replace <strong>{person.full_name}</strong> with{" "}
              <strong>{pendingChange.name}</strong>?
            </>
          ) : (
            <>
              Assign <strong>{pendingChange.name}</strong> to this route?
            </>
          )}
        </p>
        <div className="lf-deliverer-change-confirm-actions">
          <button
            type="button"
            className="lf-link"
            style={linkBtnStyle}
            disabled={assigningId != null}
            onClick={cancelPendingChange}
          >
            Cancel
          </button>
          <button
            type="button"
            className="lf-btn lf-btn--primary"
            style={primaryBtnStyle}
            disabled={assigningId != null}
            onClick={() => void handleAssign(pendingChange.id)}
          >
            {assigningId != null ? (person ? "Changing…" : "Assigning…") : person ? "Confirm change" : "Confirm assignment"}
          </button>
        </div>
      </div>
    );
  }

  if (confirmingRemove && person) {
    return (
      <div className="lf-deliverer-change-confirm">
        <p>
          Remove <strong>{person.full_name}</strong> from this route?
        </p>
        <div className="lf-deliverer-change-confirm-actions">
          <button
            type="button"
            className="lf-link"
            style={linkBtnStyle}
            disabled={removing}
            onClick={() => setConfirmingRemove(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="lf-btn lf-btn--outline lf-text-red"
            style={destructiveBtnStyle}
            disabled={removing}
            onClick={() => void handleRemove()}
          >
            {removing ? "Removing…" : "Confirm remove"}
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
                  className="lf-btn lf-btn--primary"
                  style={primaryBtnStyle}
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
                  style={outlineBtnStyle}
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
                className="lf-btn lf-btn--primary"
                style={primaryBtnStyle}
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

      {!hideChangeRemoveActions && (canAssign || canRemove) && person && !picking && (
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexDirection: compact ? "column" : "row" }}>
          {canAssign && (
            <button
              type="button"
              className="lf-btn lf-btn--outline"
              style={{ ...outlineBtnStyle, width: compact ? "100%" : undefined }}
              disabled={assigningId != null}
              onClick={() => setPicking(true)}
            >
              Change deliverer
            </button>
          )}
          {canRemove && (
            <button
              type="button"
              className="lf-btn lf-btn--outline lf-text-red"
              style={{ ...destructiveBtnStyle, width: compact ? "100%" : undefined }}
              disabled={assigningId != null}
              onClick={() => setConfirmingRemove(true)}
            >
              Remove deliverer
            </button>
          )}
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
                style={linkBtnStyle}
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
                    style={{ ...linkBtnStyle, display: "inline-flex", alignItems: "center", gap: 4 }}
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
                  style={linkBtnStyle}
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

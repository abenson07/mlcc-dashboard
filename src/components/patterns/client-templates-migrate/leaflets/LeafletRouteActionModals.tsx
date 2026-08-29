"use client";

import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";

export type SkipRouteConfirmModalProps = {
  isOpen: boolean;
  routeLabel: string;
  submitting?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function SkipRouteConfirmModal({
  isOpen,
  routeLabel,
  submitting = false,
  onConfirm,
  onCancel,
}: SkipRouteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Skip route"
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancel" variant="ghost" onClick={onCancel} />
          <Button
            label={submitting ? "Skipping…" : "Confirm skip"}
            variant="primary"
            onClick={() => {
              void onConfirm();
            }}
          />
        </div>
      }
    >
      <Text size="sm" color="secondary">
        Mark <span style={{ color: "var(--linear-color-ink)", fontWeight: 500 }}>{routeLabel}</span>{" "}
        as needing a substitute deliverer.
      </Text>
    </Modal>
  );
}

export type RemoveRoutesConfirmModalProps = {
  isOpen: boolean;
  personName: string;
  /** When removing more than one route for a deliverer. */
  allRoutes?: boolean;
  submitting?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function RemoveRoutesConfirmModal({
  isOpen,
  personName,
  allRoutes = false,
  submitting = false,
  onConfirm,
  onCancel,
}: RemoveRoutesConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={allRoutes ? "Remove all routes" : "Remove route"}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancel" variant="ghost" onClick={onCancel} />
          <Button
            label={submitting ? "Removing…" : "Confirm remove"}
            variant="primary"
            onClick={() => {
              void onConfirm();
            }}
          />
        </div>
      }
    >
      <Text size="sm" color="secondary">
        {allRoutes ? (
          <>
            Remove{" "}
            <span style={{ color: "var(--linear-color-ink)", fontWeight: 500 }}>{personName}</span>{" "}
            from all of their routes on this leaflet?
          </>
        ) : (
          <>
            Remove{" "}
            <span style={{ color: "var(--linear-color-ink)", fontWeight: 500 }}>{personName}</span>{" "}
            from this route? This also clears the route&apos;s default deliverer.
          </>
        )}
      </Text>
    </Modal>
  );
}

export type AssignScopeConfirmModalProps = {
  isOpen: boolean;
  personName: string;
  routeLabel: string;
  submitting?: boolean;
  onThisRouteOnly: () => void | Promise<void>;
  onPermanent: () => void | Promise<void>;
  onCancel: () => void;
};

export function AssignScopeConfirmModal({
  isOpen,
  personName,
  routeLabel,
  submitting = false,
  onThisRouteOnly,
  onPermanent,
  onCancel,
}: AssignScopeConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Make this the default?"
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Button label="Cancel" variant="ghost" onClick={onCancel} disabled={submitting} />
          <Button
            label="This route only"
            variant="secondary"
            disabled={submitting}
            onClick={() => {
              void onThisRouteOnly();
            }}
          />
          <Button
            label={submitting ? "Saving…" : "Permanent"}
            variant="primary"
            disabled={submitting}
            onClick={() => {
              void onPermanent();
            }}
          />
        </div>
      }
    >
      <Text size="sm" color="secondary">
        Assign{" "}
        <span style={{ color: "var(--linear-color-ink)", fontWeight: 500 }}>{personName}</span> to{" "}
        <span style={{ color: "var(--linear-color-ink)", fontWeight: 500 }}>{routeLabel}</span>.
        Permanent also updates the route&apos;s default deliverer for future leaflets.
      </Text>
    </Modal>
  );
}

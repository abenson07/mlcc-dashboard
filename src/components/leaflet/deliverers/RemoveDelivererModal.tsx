"use client";

import { destructiveBtnStyle, linkBtnStyle } from "./actionButtonStyles";

type RemoveDelivererModalProps = {
  personName: string;
  submitting: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export default function RemoveDelivererModal({
  personName,
  submitting,
  onConfirm,
  onCancel,
}: RemoveDelivererModalProps) {
  return (
    <div className="lf-modal-overlay" onClick={submitting ? undefined : onCancel}>
      <div
        className="lf-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-deliverer-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lf-modal-header">
          <span id="remove-deliverer-modal-title" className="lf-modal-title">
            Remove deliverer
          </span>
        </div>
        <div className="lf-modal-body">
          <p className="lf-meta">
            Remove <strong style={{ color: "var(--lf-text)" }}>{personName}</strong> from this
            route? This also clears the route&apos;s default deliverer.
          </p>
        </div>
        <div className="lf-modal-footer">
          <button
            type="button"
            className="lf-link"
            style={linkBtnStyle}
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="lf-btn lf-btn--outline lf-text-red"
            style={destructiveBtnStyle}
            onClick={() => onConfirm()}
            disabled={submitting}
          >
            {submitting ? "Removing…" : "Confirm remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import DelivererPicker from "./DelivererPicker";

type DelivererCellProps = {
  personName?: string | null;
  excludePersonId?: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (person: { id: string; name: string }) => void;
};

export default function DelivererCell({
  personName,
  excludePersonId,
  isOpen,
  onToggle,
  onClose,
  onSelect,
}: DelivererCellProps) {
  return (
    <td>
      <div className="lf-selector">
        <button
          type="button"
          className={`lf-table-deliverer-trigger${personName ? "" : " lf-table-deliverer-placeholder"}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {personName ?? "Assign deliverer"}
        </button>
        {isOpen && (
          <>
            <div
              className="lf-selector-backdrop"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            />
            <div
              className="lf-selector-menu"
              style={{ width: 260, padding: 8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <DelivererPicker excludePersonId={excludePersonId} onSelect={onSelect} onCancel={onClose} />
            </div>
          </>
        )}
      </div>
    </td>
  );
}

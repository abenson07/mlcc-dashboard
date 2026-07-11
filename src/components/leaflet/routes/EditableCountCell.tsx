type EditableCountCellProps = {
  value: number | null | undefined;
  isEditing: boolean;
  draft: string;
  onStartEdit: (initial: string) => void;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function EditableCountCell({
  value,
  isEditing,
  draft,
  onStartEdit,
  onDraftChange,
  onSave,
  onCancel,
}: EditableCountCellProps) {
  return (
    <td className="lf-meta">
      {isEditing ? (
        <input
          type="text"
          inputMode="numeric"
          className="lf-count-input"
          autoFocus
          value={draft}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onDraftChange(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSave();
            } else if (e.key === "Escape") {
              onCancel();
            }
          }}
        />
      ) : (
        <button
          type="button"
          className="lf-count-trigger"
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit(value != null ? String(value) : "");
          }}
        >
          {value ?? "—"}
        </button>
      )}
    </td>
  );
}

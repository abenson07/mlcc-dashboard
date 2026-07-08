"use client";

import { useMemo, useState } from "react";
import { Command } from "cmdk";
import { usePeople } from "hooks";
import PropertyPopover from "./property/PropertyPopover";
import { IconSwap } from "./widgetIcons";

export type PickedPerson = { id: string; name: string; email: string | null };

type DelivererNameFieldProps = {
  personName: string | null;
  hasPerson: boolean;
  readOnly?: boolean;
  excludePersonId?: string | null;
  statusLabel?: string;
  onPickPerson: (person: PickedPerson) => void;
  onSkip: () => void;
  onRemove: () => void;
};

export default function DelivererNameField({
  personName,
  hasPerson,
  readOnly = false,
  excludePersonId = null,
  statusLabel,
  onPickPerson,
  onSkip,
  onRemove,
}: DelivererNameFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

  const { people, loading } = usePeople({
    autoFetch: trimmed.length > 0,
    filters: { search: trimmed || undefined },
  });

  const candidates = useMemo(
    () => people.filter((p) => p.id !== excludePersonId).slice(0, 12),
    [people, excludePersonId],
  );

  function close() {
    setOpen(false);
    setQuery("");
  }

  if (readOnly) {
    return (
      <span
        className={`shell-widget-property-static${hasPerson ? "" : " shell-widget-property-trigger--placeholder"}`}
      >
        {personName ?? "Unassigned"}
        {hasPerson && statusLabel && <span className="shell-widget-deliverer-status"> · {statusLabel}</span>}
      </span>
    );
  }

  return (
    <div className="shell-widget-deliverer-field" style={{ flex: 1, minWidth: 0 }}>
      <PropertyPopover
        open={open}
        onClose={close}
        trigger={
          <button
            type="button"
            className={`shell-widget-property-trigger shell-widget-deliverer-trigger${hasPerson ? "" : " shell-widget-property-trigger--placeholder"}`}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="shell-widget-deliverer-trigger-label">
              {personName ?? "Add deliverer"}
              {hasPerson && statusLabel && <span className="shell-widget-deliverer-status"> · {statusLabel}</span>}
            </span>
            <span className="shell-widget-deliverer-swap-icon">
              <IconSwap />
            </span>
          </button>
        }
      >
        <Command shouldFilter={false}>
          <Command.Input
            className="shell-widget-popover-search"
            placeholder="Search people…"
            value={query}
            onValueChange={setQuery}
            autoFocus
          />
          {trimmed.length === 0 ? (
            <div className="shell-widget-popover-list">
              {hasPerson && (
                <div className="shell-widget-popover-item shell-widget-popover-item--static" aria-disabled="true">
                  <span className="shell-widget-popover-item-label">
                    {personName}
                    {statusLabel && <span className="shell-widget-deliverer-status"> · {statusLabel}</span>}
                  </span>
                  <span className="shell-widget-popover-item-check">✓</span>
                </div>
              )}
              {hasPerson && (
                <>
                  <div className="shell-widget-popover-group-header">Actions</div>
                  <button
                    type="button"
                    className="shell-widget-popover-item"
                    onClick={() => {
                      close();
                      onSkip();
                    }}
                  >
                    <span className="shell-widget-popover-item-label">Skip route</span>
                  </button>
                  <button
                    type="button"
                    className="shell-widget-popover-item shell-widget-popover-item--danger"
                    onClick={() => {
                      close();
                      onRemove();
                    }}
                  >
                    <span className="shell-widget-popover-item-label">Remove deliverer</span>
                  </button>
                </>
              )}
              {!hasPerson && (
                <div className="shell-widget-popover-hint">Type a name or email to search</div>
              )}
            </div>
          ) : (
            <Command.List className="shell-widget-popover-list">
              {loading && <div className="shell-widget-popover-hint">Searching…</div>}
              {!loading && candidates.length === 0 && (
                <Command.Empty className="shell-widget-popover-empty">No matching people</Command.Empty>
              )}
              {candidates.map((p) => (
                <Command.Item
                  key={p.id}
                  value={p.id}
                  className="shell-widget-popover-item"
                  onSelect={() => {
                    close();
                    onPickPerson({ id: p.id, name: p.full_name, email: p.email });
                  }}
                >
                  <span className="shell-widget-popover-item-label">
                    {p.full_name}
                    {p.email ? <span style={{ opacity: 0.5 }}> · {p.email}</span> : null}
                  </span>
                </Command.Item>
              ))}
            </Command.List>
          )}
        </Command>
      </PropertyPopover>
    </div>
  );
}

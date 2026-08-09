"use client";

import { Text } from "@/components/patterns/primitives/Text";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { BudgetStatusToken } from "./BudgetStatusToken";
import { sampleEventBudgetItems, type EventBudgetRow } from "@/data/mocks/events";

export type InvoicesListSectionProps = {
  onSelectInvoice?: (row: EventBudgetRow) => void;
};

/**
 * Invoice number / amount / status — boxed to match `EventTasksSection` /
 * `VolunteersListSection` / `SponsorsListSection` for the Overview's final
 * two-column row.
 */
export function InvoicesListSection({ onSelectInvoice }: InvoicesListSectionProps) {
  const { enabled: demo } = useDemoModeOptional();
  const invoices = demo ? sampleEventBudgetItems : [];
  const openCount = invoices.filter((i) => i.status !== "Paid").length;

  return (
    <section
      data-slot="invoices-list-section"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 20,
        background: "var(--linear-color-panel)",
        border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-md)",
        boxShadow: "var(--linear-shadow-panel)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Text weight="semibold">Invoices</Text>
        <Text size="sm" color="secondary">
          {openCount} open
        </Text>
      </div>

      {invoices.length === 0 ? (
        <Text size="sm" color="secondary">
          No invoices yet.
        </Text>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {invoices.map((invoice) => (
            <button
              key={invoice.id}
              type="button"
              onClick={() => onSelectInvoice?.(invoice)}
              style={{
                all: "unset",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 4px",
                borderRadius: "var(--linear-radius-sm)",
                cursor: onSelectInvoice ? "pointer" : "default",
              }}
            >
              <Text size="sm" style={{ flex: 1, minWidth: 0 }}>
                {invoice.invoiceNumber}
              </Text>
              <Text size="sm" color="secondary">
                {invoice.amount}
              </Text>
              <span style={{ flexShrink: 0, width: 84, display: "flex", justifyContent: "flex-end" }}>
                <BudgetStatusToken item={invoice} />
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { AllTransactionsPage } from "@/components/patterns/client-templates/transactions";

/**
 * Invoices — its own nav entry/title/route, but reuses the existing
 * transactions data and grouped-table chrome directly since transaction
 * rows already represent invoice-like payment records (past_due/paid/etc).
 */
export function InvoicesDemo() {
  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={1200}
        header={<CanvasHeader topbar={{ title: "Invoices" }} />}
      >
        <AllTransactionsPage />
      </FoundationLayout>
    </div>
  );
}

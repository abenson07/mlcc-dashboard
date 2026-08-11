import { Suspense } from "react";
import ActionItemsPageContent from "@/components/integrated/action-items/ActionItemsPageContent";

export default function ShellPreviewActionItemsPage() {
  return (
    <Suspense fallback={<p className="lf-meta">Loading action items…</p>}>
      <ActionItemsPageContent embedded />
    </Suspense>
  );
}

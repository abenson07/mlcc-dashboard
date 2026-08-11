import { Suspense } from "react";
import FaqsPageContent from "@/components/integrated/faqs/FaqsPageContent";

export default function ShellPreviewFaqsPage() {
  return (
    <Suspense fallback={<p className="lf-meta">Loading FAQs…</p>}>
      <FaqsPageContent />
    </Suspense>
  );
}

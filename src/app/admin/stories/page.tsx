import { Suspense } from "react";
import StoriesPageContent from "@/components/stories/StoriesPageContent";

export default function ShellPreviewStoriesPage() {
  return (
    <Suspense fallback={<p className="lf-meta">Loading stories…</p>}>
      <StoriesPageContent />
    </Suspense>
  );
}

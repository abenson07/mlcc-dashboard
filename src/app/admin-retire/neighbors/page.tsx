import { Suspense } from "react";
import PeoplePageContent from "@/components/integrated/people/PeoplePageContent";

export default function ShellPreviewNeighborsPage() {
  return (
    <Suspense fallback={<p className="lf-meta">Loading neighbors…</p>}>
      <PeoplePageContent embedded basePath="/admin-retire/neighbors" />
    </Suspense>
  );
}

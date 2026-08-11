import { Suspense } from "react";
import PeoplePageContent from "@/components/integrated/people/PeoplePageContent";

export default function ShellPreviewBusinessesPage() {
  return (
    <Suspense fallback={<p className="lf-meta">Loading businesses…</p>}>
      <PeoplePageContent
        embedded
        basePath="/admin-retire/businesses"
        defaultFilter="businesses"
      />
    </Suspense>
  );
}

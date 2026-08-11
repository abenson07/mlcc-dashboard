import { Suspense } from "react";
import PeoplePageContent from "@/components/integrated/people/PeoplePageContent";

export default function ShellPreviewMembersPage() {
  return (
    <Suspense fallback={<p className="lf-meta">Loading members…</p>}>
      <PeoplePageContent
        embedded
        basePath="/admin-retire/members"
        defaultFilter="members"
      />
    </Suspense>
  );
}

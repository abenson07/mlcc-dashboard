"use client";

import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { Badge } from "@/components/patterns/primitives/Badge";
import { CommitteeDetailPage } from "./CommitteeDetailPage";
import { sampleCommitteeDetail } from "@/data/mocks/committees";

export function CommitteeDetailDemo() {
  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={1200}
        header={
          <CanvasHeader
            topbar={{
              title: sampleCommitteeDetail.name,
              titleAdornment: <Badge label={sampleCommitteeDetail.cadence} />,
              hasFavorite: true,
            }}
          />
        }
      >
        <CommitteeDetailPage committee={sampleCommitteeDetail} />
      </FoundationLayout>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useLeaflets } from "hooks";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { Button } from "@/components/patterns/primitives/Button";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";
import { newDemoId, upsertDemoEntity } from "@/lib/demo/demoStore";
import { LeafletsListPage } from "./LeafletsListPage";
import { NewLeafletModal, type NewLeafletDraft } from "./NewLeafletModal";

export function LeafletsDemo() {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const { enabled: demo } = useDemoModeOptional();
  const { create } = useLeaflets({ autoFetch: false });
  const [isAddOpen, setIsAddOpen] = useState(false);

  async function handleCreateLeaflet(draft: NewLeafletDraft) {
    if (demo) {
      const id = newDemoId("lf");
      upsertDemoEntity("leaflets", {
        id,
        title: draft.title,
        distributionDate: draft.distribution_date,
        status: "planned",
      });
      toast.success("Leaflet created — demo mode, saved locally only");
      router.push(`${basePath}/leaflets/${id}`);
      return;
    }
    const created = await create(draft);
    if (created) router.push(`${basePath}/leaflets/${created.id}`);
  }

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={1200}
        header={
          <CanvasHeader
            topbar={{
              title: "Leaflets",
              endContent: (
                <Button
                  label="Add leaflet"
                  variant="secondary"
                  icon={<Plus size={14} strokeWidth={1.75} />}
                  onClick={() => setIsAddOpen(true)}
                />
              ),
            }}
          />
        }
      >
        <div
          style={{
            height: "100%",
            minHeight: 0,
            overflow: "auto",
            boxSizing: "border-box",
            padding: "32px 24px 64px",
          }}
        >
          <LeafletsListPage onCreateClick={() => setIsAddOpen(true)} />
        </div>
      </FoundationLayout>

      <NewLeafletModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreate={handleCreateLeaflet}
      />
    </div>
  );
}

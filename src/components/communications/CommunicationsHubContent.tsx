"use client";

import React, { useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import TableViewTabs from "@/components/common/TableViewTabs";
import BannersManager, {
  type BannersManagerHandle,
} from "@/components/banners/BannersManager";
import ScheduledEmailsTable from "./ScheduledEmailsTable";
import ScheduledSocialTable from "./ScheduledSocialTable";

export type CommunicationsTableView = "email" | "social" | "banners";

function parseCommunicationsView(
  sp: URLSearchParams | null,
): CommunicationsTableView {
  const raw = sp?.get("view");
  if (raw === "social") return "social";
  if (raw === "banners") return "banners";
  return "email";
}

function communicationsHref(view: CommunicationsTableView): string {
  if (view === "email") return "/communications";
  return `/communications?view=${view}`;
}

function CommunicationsViewTabs({
  view,
  setView,
  trailing,
}: {
  view: CommunicationsTableView;
  setView: (next: CommunicationsTableView) => void;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-mercury-line dark:border-white/10">
      <TableViewTabs<CommunicationsTableView>
        aria-label="Communications data views"
        value={view}
        onChange={setView}
        className="min-w-0 flex-1 border-b-0"
        tabs={[
          { value: "email", label: "Email" },
          { value: "social", label: "Social" },
          { value: "banners", label: "Banners" },
        ]}
      />
      {trailing ? (
        <div className="shrink-0 pb-3">{trailing}</div>
      ) : null}
    </div>
  );
}

function CommunicationsHubPane({
  view,
  setView,
  bannersRef,
}: {
  view: CommunicationsTableView;
  setView: (next: CommunicationsTableView) => void;
  bannersRef: React.RefObject<BannersManagerHandle | null>;
}) {
  const newBannerButton =
    view === "banners" ? (
      <button
        type="button"
        onClick={() => bannersRef.current?.openCreate()}
        className="inline-flex shrink-0 items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 hover:text-white"
      >
        New banner
      </button>
    ) : undefined;

  return (
    <ComponentCard hideHeader>
      <CommunicationsViewTabs
        view={view}
        setView={setView}
        trailing={newBannerButton}
      />
      {view === "email" ? <ScheduledEmailsTable /> : null}
      {view === "social" ? <ScheduledSocialTable /> : null}
      {view === "banners" ? <BannersManager ref={bannersRef} /> : null}
    </ComponentCard>
  );
}

export default function CommunicationsHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bannersRef = useRef<BannersManagerHandle>(null);
  const view = useMemo(
    () => parseCommunicationsView(searchParams),
    [searchParams],
  );

  const setView = (next: CommunicationsTableView) => {
    router.replace(communicationsHref(next));
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Communications" />
      <div className="mt-2 space-y-4">
        <CommunicationsHubPane
          key={view}
          view={view}
          setView={setView}
          bannersRef={bannersRef}
        />
      </div>
    </div>
  );
}

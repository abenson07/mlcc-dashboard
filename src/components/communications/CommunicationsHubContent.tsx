"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import TableViewTabs from "@/components/common/TableViewTabs";
import BannersManager, {
  type BannersManagerHandle,
} from "@/components/banners/BannersManager";
import ScheduledEmailsTable from "./ScheduledEmailsTable";
import ScheduledSocialTable from "./ScheduledSocialTable";
import QrCodesTable from "./QrCodesTable";
import AddQrCodeModal from "./AddQrCodeModal";
import type { QrCodes } from "@/types/database";

export type CommunicationsTableView = "email" | "social" | "banners" | "qr-codes";

function parseCommunicationsView(
  sp: URLSearchParams | null,
): CommunicationsTableView {
  const raw = sp?.get("view");
  if (raw === "social") return "social";
  if (raw === "banners") return "banners";
  if (raw === "qr-codes") return "qr-codes";
  return "email";
}

function communicationsHref(view: CommunicationsTableView): string {
  if (view === "email") return "/old-admin/communications";
  return `/old-admin/communications?view=${view}`;
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
          { value: "qr-codes", label: "QR codes" },
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
  onOpenNewQrCode,
  onEditQrCode,
}: {
  view: CommunicationsTableView;
  setView: (next: CommunicationsTableView) => void;
  bannersRef: React.RefObject<BannersManagerHandle | null>;
  onOpenNewQrCode: () => void;
  onEditQrCode: (row: QrCodes) => void;
}) {
  const trailingButton =
    view === "banners" ? (
      <button
        type="button"
        onClick={() => bannersRef.current?.openCreate()}
        className="inline-flex shrink-0 items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 hover:text-white"
      >
        New banner
      </button>
    ) : view === "qr-codes" ? (
      <button
        type="button"
        onClick={onOpenNewQrCode}
        className="inline-flex shrink-0 items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 hover:text-white"
      >
        New QR code
      </button>
    ) : undefined;

  return (
    <ComponentCard hideHeader>
      <CommunicationsViewTabs
        view={view}
        setView={setView}
        trailing={trailingButton}
      />
      {view === "email" ? <ScheduledEmailsTable /> : null}
      {view === "social" ? <ScheduledSocialTable /> : null}
      {view === "banners" ? <BannersManager ref={bannersRef} /> : null}
      {view === "qr-codes" ? <QrCodesTable onEdit={onEditQrCode} /> : null}
    </ComponentCard>
  );
}

export default function CommunicationsHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bannersRef = useRef<BannersManagerHandle>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [editingQr, setEditingQr] = useState<QrCodes | null>(null);
  const view = useMemo(
    () => parseCommunicationsView(searchParams),
    [searchParams],
  );

  const setView = (next: CommunicationsTableView) => {
    router.replace(communicationsHref(next));
  };

  const openNewQrCode = () => {
    setEditingQr(null);
    setQrModalOpen(true);
  };

  const openEditQrCode = (row: QrCodes) => {
    setEditingQr(row);
    setQrModalOpen(true);
  };

  const closeQrModal = () => {
    setQrModalOpen(false);
    setEditingQr(null);
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
          onOpenNewQrCode={openNewQrCode}
          onEditQrCode={openEditQrCode}
        />
      </div>
      <AddQrCodeModal
        isOpen={qrModalOpen}
        onClose={closeQrModal}
        editing={editingQr}
      />
    </div>
  );
}

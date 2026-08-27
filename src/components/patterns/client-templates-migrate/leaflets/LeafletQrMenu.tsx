"use client";

import { useMemo, useState } from "react";
import { QrCode as QrCodeIcon } from "lucide-react";
import { useLeafletQr } from "hooks";
import { IconButton } from "@/components/patterns/primitives/IconButton";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Dropdown, DropdownItem } from "@/components/patterns/shared/dropdown";
import { QrCodePreviewModal } from "@/components/patterns/client-templates-migrate/qr-codes/QrCodePreviewModal";
import { sampleLeafletQrCodes } from "@/data/mocks/leaflets";
import type { QrCodes } from "@/types/database";

export type LeafletQrMenuProps = {
  demo?: boolean;
  membershipQrCodeId?: string | null;
  openRoutesQrCodeId?: string | null;
};

type LeafletQrMenuItem = {
  id: string;
  label: string;
  code: QrCodes;
};

function sampleToQrCodes(): LeafletQrMenuItem[] {
  const now = new Date().toISOString();
  return sampleLeafletQrCodes.map((sample) => ({
    id: sample.id,
    label: sample.label,
    code: {
      id: sample.id,
      name: sample.label,
      url: sample.url,
      created_at: now,
      updated_at: now,
    },
  }));
}

/**
 * Topbar QR-codes control — a dropdown of this leaflet's membership and
 * open-routes QR codes; picking one opens `QrCodePreviewModal`.
 */
export function LeafletQrMenu({
  demo = false,
  membershipQrCodeId = null,
  openRoutesQrCodeId = null,
}: LeafletQrMenuProps) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<QrCodes | null>(null);

  const { data: membershipQr } = useLeafletQr(demo ? null : membershipQrCodeId);
  const { data: openRoutesQr } = useLeafletQr(demo ? null : openRoutesQrCodeId);

  const items = useMemo((): LeafletQrMenuItem[] => {
    if (demo) return sampleToQrCodes();
    const next: LeafletQrMenuItem[] = [];
    if (membershipQr) {
      next.push({
        id: membershipQr.id,
        label: "Membership QR Code",
        code: { ...membershipQr, name: "Membership QR Code" },
      });
    }
    if (openRoutesQr) {
      next.push({
        id: openRoutesQr.id,
        label: "Leaflet Routes QR Code",
        code: { ...openRoutesQr, name: "Leaflet Routes QR Code" },
      });
    }
    return next;
  }, [demo, membershipQr, openRoutesQr]);

  function handleSelect(item: LeafletQrMenuItem) {
    setMenuOpen(false);
    setSelectedCode(item.code);
  }

  return (
    <>
      <Dropdown
        label="QR codes"
        open={isMenuOpen}
        onOpenChange={setMenuOpen}
        placement="below"
        alignment="end"
        trigger={
          <IconButton
            label="QR codes"
            variant="ghost"
            size="sm"
            icon={<Icon icon={QrCodeIcon} size="sm" color="secondary" />}
          />
        }
      >
        {items.length === 0 ? (
          <DropdownItem label="No QR codes for this leaflet" disabled />
        ) : (
          items.map((item) => (
            <DropdownItem key={item.id} label={item.label} onSelect={() => handleSelect(item)} />
          ))
        )}
      </Dropdown>

      <QrCodePreviewModal code={selectedCode} onClose={() => setSelectedCode(null)} />
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import { useBusinesses } from "hooks";
import { IconButton } from "@/components/patterns/primitives/IconButton";
import { Icon } from "@/components/patterns/primitives/Icon";
import { LeafletListModal } from "./LeafletListModal";
import { sampleLeafletBusinessList } from "@/data/mocks/leaflets";

export type LeafletListsMenuProps = {
  demo?: boolean;
};

/**
 * Topbar business-members control — opens a modal of current member
 * businesses with copy-to-clipboard.
 */
export function LeafletListsMenu({ demo = false }: LeafletListsMenuProps) {
  const [isOpen, setOpen] = useState(false);
  const { businesses } = useBusinesses({
    autoFetch: !demo,
    filters: { isMember: true },
  });

  const names = useMemo(
    () =>
      demo
        ? sampleLeafletBusinessList
        : businesses.map((business) => business.business_name).filter((name): name is string => Boolean(name)),
    [demo, businesses],
  );

  return (
    <>
      <IconButton
        label="Business list"
        variant="ghost"
        size="sm"
        icon={<Icon icon={Building2} size="sm" color="secondary" />}
        onClick={() => setOpen(true)}
      />

      <LeafletListModal isOpen={isOpen} names={names} onClose={() => setOpen(false)} />
    </>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import TableWithDetailSidebar from "@/components/detail-sidebar/TableWithDetailSidebar";
import type { DuplicateMember } from "@/app/api/stripe/duplicate-members/route";
import {
  MercuryVariantTable,
  mercuryReadOnlySidebarTitle,
  renderMercuryReadOnlySidebar,
  resolveMercurySelectedItem,
} from "@/components/table/mercury-demo/mercuryVariantTable";
import { useMercuryPlaygroundData } from "@/components/table/mercury-demo/useMercuryPlaygroundData";

export default function DuplicateMembersContent() {
  const mercury = useMercuryPlaygroundData("neighbors-duplicate-memberships");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => resolveMercurySelectedItem("neighbors-duplicate-memberships", mercury, selectedId) as DuplicateMember | null,
    [mercury, selectedId],
  );

  const sidebarTitle = useMemo(
    () => mercuryReadOnlySidebarTitle("neighbors-duplicate-memberships", selected),
    [selected],
  );

  if (mercury.activeLoading) {
    return (
      <ComponentCard title="Duplicate Members">
        <p className="text-gray-500 dark:text-gray-400">Loading duplicate members…</p>
      </ComponentCard>
    );
  }

  if (mercury.activeError) {
    return (
      <ComponentCard title="Duplicate Members">
        <p className="text-red-600 dark:text-red-400">{mercury.activeError}</p>
      </ComponentCard>
    );
  }

  if (mercury.duplicateMembers.length === 0) {
    return (
      <ComponentCard title="Duplicate Members">
        <p className="text-gray-500 dark:text-gray-400">
          No duplicate members found. Duplicate members are customers who have the same email and two
          or more active subscriptions in Stripe.
        </p>
      </ComponentCard>
    );
  }

  return (
    <TableWithDetailSidebar
      selectedItem={selected}
      onClose={() => setSelectedId(null)}
      sidebarTitle={sidebarTitle}
      asideWidthClass="w-full max-w-[420px]"
      dashboardTable={{ showSelectColumn: true, showMenuColumn: true }}
      renderSidebar={(item) =>
        item ? renderMercuryReadOnlySidebar("neighbors-duplicate-memberships", item) : null
      }
    >
      <ComponentCard title="Duplicate Members">
        <MercuryVariantTable
          variant="neighbors-duplicate-memberships"
          mercury={mercury}
          selectedKey={selectedId}
          onSelectKey={setSelectedId}
        />
      </ComponentCard>
    </TableWithDetailSidebar>
  );
}

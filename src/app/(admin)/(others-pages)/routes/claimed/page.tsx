import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ClaimedRoutesTable, {
  ClaimedRoutesHeaderAction,
} from "@/components/tables/ClaimedRoutesTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Claimed Routes",
  description: "View claimed routes",
};

export default function ClaimedRoutesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Claimed Routes" />
      <div className="space-y-6">
        <ComponentCard
          title="Claimed Routes"
          action={<ClaimedRoutesHeaderAction />}
        >
          <ClaimedRoutesTable />
        </ComponentCard>
      </div>
    </div>
  );
}

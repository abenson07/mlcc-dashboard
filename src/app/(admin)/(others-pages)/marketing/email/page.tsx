import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MarketingEmailComposer from "@/components/marketing/MarketingEmailComposer";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Marketing email",
  description: "Draft and send marketing broadcasts via Resend",
};

export default function MarketingEmailPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Marketing email" />
      <div className="space-y-6 mt-2">
        <MarketingEmailComposer />
      </div>
    </div>
  );
}

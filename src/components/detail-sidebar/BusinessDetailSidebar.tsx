"use client";

import React from "react";
import type { BusinessWithDetails } from "hooks";
import { CopyableEmail } from "@/components/common/CopyableEmail";

interface BusinessDetailSidebarProps {
  business: BusinessWithDetails;
}

export default function BusinessDetailSidebar({ business }: BusinessDetailSidebarProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Business name
        </p>
        <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
          {business.business_name ?? "—"}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Contact
        </p>
        <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
          {business.contact_name ?? "—"}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Email
        </p>
        <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
          {business.email ? <CopyableEmail email={business.email} /> : "—"}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Phone
        </p>
        <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
          {business.phone ?? "—"}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Address
        </p>
        <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
          {business.address ?? "—"}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Membership
        </p>
        <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
          {business.membership?.status ?? "—"}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Notes
        </p>
        <p className="mt-1 text-sm text-gray-800 dark:text-white/90 whitespace-pre-wrap">
          {business.notes ?? "—"}
        </p>
      </div>
    </div>
  );
}

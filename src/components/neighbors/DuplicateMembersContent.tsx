"use client";

import React, { useEffect, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import DuplicateMemberSubscriptionsTable from "@/components/tables/DuplicateMemberSubscriptionsTable";
import type { DuplicateMember } from "@/app/api/stripe/duplicate-members/route";
import { getApiBase } from "@/lib/apiBase";
import Button from "@/components/ui/button/Button";

export default function DuplicateMembersContent() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateMembers, setDuplicateMembers] = useState<DuplicateMember[]>([]);
  const [lastScannedAt, setLastScannedAt] = useState<string | null>(null);

  async function fetchData(showSpinner: boolean) {
    if (showSpinner) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBase()}/api/stripe/duplicate-members`);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as { duplicateMembers?: DuplicateMember[] };
      setDuplicateMembers(data.duplicateMembers ?? []);
      setLastScannedAt(new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load duplicate members");
    } finally {
      if (showSpinner) setLoading(false);
      else setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchData(true);
  }, []);

  if (loading) {
    return (
      <ComponentCard title="Duplicate Members">
        <p className="text-gray-500 dark:text-gray-400">Loading duplicate members...</p>
      </ComponentCard>
    );
  }

  if (error) {
    return (
      <ComponentCard title="Duplicate Members">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </ComponentCard>
    );
  }

  if (duplicateMembers.length === 0) {
    return (
      <ComponentCard title="Duplicate Members">
        <p className="text-gray-500 dark:text-gray-400">
          No duplicate memberships found for monitored products.
        </p>
      </ComponentCard>
    );
  }

  return (
    <>
      <ComponentCard
        title="Duplicate Membership Monitor"
        desc={
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>{duplicateMembers.length} duplicate groups currently detected.</p>
            {lastScannedAt && (
              <p>Last scanned: {new Date(lastScannedAt).toLocaleString()}</p>
            )}
          </div>
        }
        action={
          <Button onClick={() => fetchData(false)} disabled={refreshing}>
            {refreshing ? "Re-scanning..." : "Re-scan"}
          </Button>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Duplicates are grouped by membership product and flagged when active subscriptions share the same email or normalized address.
        </p>
      </ComponentCard>

      {duplicateMembers.map((group) => (
        <ComponentCard
          key={group.id}
          title={group.productName}
          desc={
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Matched by {group.matchType}:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {group.matchValue}
              </span>
            </div>
          }
        >
          <DuplicateMemberSubscriptionsTable subscriptions={group.subscriptions} />
        </ComponentCard>
      ))}
    </>
  );
}

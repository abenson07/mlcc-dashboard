"use client";

import React, { useEffect, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { CopyableEmail } from "@/components/common/CopyableEmail";
import DuplicateMemberSubscriptionsTable from "@/components/tables/DuplicateMemberSubscriptionsTable";
import type { DuplicateMember } from "@/app/api/stripe/duplicate-members/route";
import { getApiBase } from "@/lib/apiBase";

export default function DuplicateMembersContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duplicateMembers, setDuplicateMembers] = useState<DuplicateMember[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${getApiBase()}/api/stripe/duplicate-members`);
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? `Request failed: ${res.status}`);
        }
        const data = (await res.json()) as { duplicateMembers?: DuplicateMember[] };
        if (!cancelled) {
          setDuplicateMembers(data.duplicateMembers ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load duplicate members");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
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
          No duplicate members found. Duplicate members are customers who have the same email and two or more active subscriptions in Stripe.
        </p>
      </ComponentCard>
    );
  }

  return (
    <>
      {duplicateMembers.map((member) => (
        <ComponentCard
          key={member.email}
          title={member.name}
          desc={
            <CopyableEmail
              email={member.email}
              className="text-sm text-gray-500 dark:text-gray-400"
            />
          }
        >
          <DuplicateMemberSubscriptionsTable subscriptions={member.subscriptions} />
        </ComponentCard>
      ))}
    </>
  );
}

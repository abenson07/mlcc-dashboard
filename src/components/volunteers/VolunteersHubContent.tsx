"use client";

import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import TableViewTabs from "@/components/common/TableViewTabs";
import Button from "@/components/ui/button/Button";
import VolunteerAsksTable from "./VolunteerAsksTable";
import VolunteerEventRoster from "./VolunteerEventRoster";
import AddVolunteerAskModal from "./AddVolunteerAskModal";
import { useVolunteerAsks, VOLUNTEER_ASKS_QUERY_KEY } from "hooks";
import type { VolunteerAskWithSignups } from "hooks";
import { getApiBase } from "@/lib/apiBase";
import { toast } from "sonner";

import { useRouter, useSearchParams } from "next/navigation";

export type VolunteerTabView = "asks" | "roster";

function parseVolunteerTab(sp: URLSearchParams | null): VolunteerTabView {
  const raw = sp?.get("tab");
  if (raw === "roster") return "roster";
  return "asks";
}

export default function VolunteersHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const tab = useMemo(() => parseVolunteerTab(searchParams), [searchParams]);
  const { asks, loading, error } = useVolunteerAsks({ autoFetch: true });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsk, setEditingAsk] = useState<VolunteerAskWithSignups | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const closeModal = () => {
    setModalOpen(false);
    setEditingAsk(null);
  };

  const openCreate = () => {
    setEditingAsk(null);
    setModalOpen(true);
  };

  const openEdit = (ask: VolunteerAskWithSignups) => {
    setEditingAsk(ask);
    setModalOpen(true);
  };

  const handleDelete = async (ask: VolunteerAskWithSignups) => {
    const signupNote =
      ask.signup_count > 0
        ? ` This will also remove ${ask.signup_count} signup${ask.signup_count === 1 ? "" : "s"}.`
        : "";
    if (
      !window.confirm(
        `Delete "${ask.title}"?${signupNote} The Webflow listing will be archived.`
      )
    ) {
      return;
    }

    setDeletingId(ask.id);
    try {
      const res = await fetch(
        `${getApiBase()}/api/volunteers/asks/${encodeURIComponent(ask.id)}`,
        { method: "DELETE" }
      );
      const json = (await res.json()) as { error?: string; webflowError?: string | null };
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to delete volunteer ask.");
      }
      if (json.webflowError) {
        toast.success("Volunteer ask deleted.");
        toast.error(json.webflowError);
      } else {
        toast.success("Volunteer ask deleted.");
      }
      void queryClient.invalidateQueries({ queryKey: VOLUNTEER_ASKS_QUERY_KEY });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete volunteer ask.");
    } finally {
      setDeletingId(null);
    }
  };

  const setTab = (next: VolunteerTabView) => {
    router.replace(next === "roster" ? "/admin/volunteers?tab=roster" : "/admin/volunteers");
  };

  const tabTitle = tab === "roster" ? "By event" : "Volunteer asks";

  return (
    <div>
      <PageBreadcrumb pageTitle="Volunteers" />
      <div className="space-y-6">
        <ComponentCard title={tabTitle}>
          <TableViewTabs<VolunteerTabView>
            aria-label="Volunteer views"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "asks", label: "Volunteer asks" },
              { value: "roster", label: "By event" },
            ]}
            endSlot={
              <Button size="sm" onClick={openCreate}>
                Add volunteer ask
              </Button>
            }
          />
          <div className="mt-6">
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading volunteers…</p>
            ) : error ? (
              <p className="text-red-600 dark:text-red-400">{error}</p>
            ) : tab === "asks" ? (
              <VolunteerAsksTable
                asks={asks}
                onEdit={openEdit}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            ) : (
              <VolunteerEventRoster asks={asks} />
            )}
          </div>
        </ComponentCard>
        <AddVolunteerAskModal
          isOpen={modalOpen}
          ask={editingAsk}
          onClose={closeModal}
          onCreated={() =>
            void queryClient.invalidateQueries({ queryKey: VOLUNTEER_ASKS_QUERY_KEY })
          }
        />
      </div>
    </div>
  );
}

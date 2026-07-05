"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TableViewTabs from "@/components/common/TableViewTabs";
import EventsTable from "@/components/events/EventsTable";
import {
  eventsListHref,
  parseListRange,
  partitionEventsByRange,
  type EventsListRange,
} from "@/components/events/eventsListUtils";
import Button from "@/components/ui/button/Button";
import { DashboardTableProvider } from "@/components/ui/table/dashboard-table-context";
import { useWebflowEvents } from "hooks";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function EventsHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listRange = parseListRange(searchParams);

  const { data, isLoading, error, refetch } = useWebflowEvents();

  const titleSlug = data?.titleFieldSlug ?? "name";
  const calSlug = data?.calendarFieldSlug ?? null;

  const { upcoming, past } = useMemo(
    () => partitionEventsByRange(data?.items ?? [], calSlug),
    [data?.items, calSlug],
  );

  const listRows = listRange === "past" ? past : upcoming;

  const setListRange = (next: EventsListRange) => {
    router.replace(eventsListHref(next === "past" ? "past" : undefined));
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Events" />
      <ComponentCard hideHeader>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-mercury-line dark:border-white/10">
          <TableViewTabs<EventsListRange>
            aria-label="Events timeframe"
            value={listRange}
            onChange={setListRange}
            className="min-w-0 flex-1 border-b-0"
            tabs={[
              { value: "upcoming", label: "Upcoming" },
              { value: "past", label: "Past Events" },
            ]}
          />
          <Link href="/old-admin/events/new" className="mb-2 shrink-0">
            <Button
              size="sm"
              className="!min-h-8 !px-3 !py-1.5 !text-xs sm:!min-h-8"
            >
              New event
            </Button>
          </Link>
        </div>
        <DashboardTableProvider
          detailOpen={false}
          showSelectColumn
          showMenuColumn
        >
          <EventsTable
            rows={listRows}
            titleFieldSlug={titleSlug}
            calendarFieldSlug={calSlug}
            range={listRange}
            loading={isLoading}
            error={error ? (error as Error).message : null}
            missingCalendarField={!calSlug && !isLoading && Boolean(data)}
            onRetry={() => void refetch()}
          />
        </DashboardTableProvider>
      </ComponentCard>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  DashboardTableDataCell,
  DashboardTableRow,
  DashboardTableSelectHeader,
  DashboardTableMenuHeader,
  NormalCellContent,
  StatusCellContent,
} from "@/components/ui/table";
import { mercuryHeaderCell } from "@/components/table/mercury-demo/shared";
import type { WebflowEventItemDTO } from "hooks";
import {
  eventSiteStatus,
  formatEventDateTime,
  type EventsListRange,
} from "./eventsListUtils";

export type EventsTableProps = {
  rows: WebflowEventItemDTO[];
  titleFieldSlug: string;
  calendarFieldSlug: string | null;
  range: EventsListRange;
  loading: boolean;
  error: string | null;
  missingCalendarField: boolean;
  onRetry: () => void;
};

export default function EventsTable({
  rows,
  titleFieldSlug,
  calendarFieldSlug,
  range,
  loading,
  error,
  missingCalendarField,
  onRetry,
}: EventsTableProps) {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [allChecked, setAllChecked] = useState(false);

  const rowIds = useMemo(() => rows.map((r) => r.id), [rows]);

  const checkedCount = useMemo(() => {
    if (allChecked) return rowIds.length;
    return rowIds.filter((id) => checked[id]).length;
  }, [allChecked, checked, rowIds]);

  const allSelected = checkedCount === rowIds.length && rowIds.length > 0;
  const indeterminate = !allSelected && checkedCount > 0;

  const handleSelectAll = () => {
    if (allSelected || allChecked) {
      setAllChecked(false);
      setChecked({});
    } else {
      setAllChecked(true);
      setChecked({});
    }
  };

  const toggleCheck = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const openEdit = (id: string) => {
    router.push(`/events/edit/${encodeURIComponent(id)}`);
  };

  const emptyMessage =
    missingCalendarField
      ? (
          <span>
            Set a DateTime field on the collection, or configure{" "}
            <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">
              WEBFLOW_EVENT_CALENDAR_FIELD_SLUG
            </code>
            .
          </span>
        )
      : range === "past"
        ? "No past events in Webflow."
        : "No upcoming events in Webflow.";

  return (
    <div className="overflow-hidden bg-white dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table className="w-full border-collapse">
          <TableHeader>
            <tr className="border-b border-gray-200 dark:border-white/[0.05]">
              <DashboardTableSelectHeader
                checked={allSelected || allChecked}
                indeterminate={indeterminate}
                onChange={handleSelectAll}
              />
              <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
                Title
              </DashboardTableDataCell>
              <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
                Date/Time
              </DashboardTableDataCell>
              <DashboardTableDataCell isHeader align="start" className={mercuryHeaderCell}>
                Site
              </DashboardTableDataCell>
              <DashboardTableMenuHeader />
            </tr>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                >
                  Loading…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-theme-sm">
                  <span className="text-red-600 dark:text-red-400">{error}</span>{" "}
                  <button type="button" className="underline" onClick={onRetry}>
                    Retry
                  </button>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const fd = row.fieldData ?? {};
                const title = String(fd[titleFieldSlug] ?? fd.name ?? "—");
                const whenRaw = calendarFieldSlug ? fd[calendarFieldSlug] : null;
                const site = eventSiteStatus(row);
                return (
                  <DashboardTableRow
                    key={row.id}
                    checked={!!checked[row.id] || allChecked}
                    onCheckChange={() => toggleCheck(row.id)}
                    onClick={() => openEdit(row.id)}
                    menuItems={[{ label: "Edit", onClick: () => openEdit(row.id) }]}
                  >
                    <DashboardTableDataCell align="start" className="py-3.5">
                      <NormalCellContent>{title}</NormalCellContent>
                    </DashboardTableDataCell>
                    <DashboardTableDataCell align="start" className="py-3.5">
                      <NormalCellContent>{formatEventDateTime(whenRaw)}</NormalCellContent>
                    </DashboardTableDataCell>
                    <DashboardTableDataCell align="start" className="py-3.5">
                      <StatusCellContent label={site.label} color={site.color} />
                    </DashboardTableDataCell>
                  </DashboardTableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

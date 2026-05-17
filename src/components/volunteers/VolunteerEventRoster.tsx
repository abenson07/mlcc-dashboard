"use client";

import ComponentCard from "@/components/common/ComponentCard";
import { CopyableEmail } from "@/components/common/CopyableEmail";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { groupVolunteerAsksByEvent } from "@/lib/volunteers/groupByEvent";
import type { VolunteerAskWithSignups } from "hooks";
import React from "react";

function formatEventDate(date: string | null): string | null {
  if (!date) return null;
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface VolunteerEventRosterProps {
  asks: VolunteerAskWithSignups[];
}

export default function VolunteerEventRoster({ asks }: VolunteerEventRosterProps) {
  const groups = groupVolunteerAsksByEvent(asks);
  const withSignups = groups.filter((g) =>
    g.asks.some((a) => a.signups.length > 0)
  );

  if (withSignups.length === 0) {
    return (
      <p className="py-10 text-center text-mercury-muted dark:text-white/50">
        No volunteers signed up yet. Assign people to asks to see them grouped by event here.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {withSignups.map((group) => {
        const dateLabel = formatEventDate(group.eventDate);
        const desc = dateLabel ? `Event date: ${dateLabel}` : undefined;

        return (
          <ComponentCard key={group.eventId ?? "general"} title={group.eventLabel} desc={desc}>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <div className="min-w-[640px]">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Volunteer ask
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Name
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Email
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {group.asks.flatMap((ask) =>
                        ask.signups.length === 0
                          ? []
                          : ask.signups.map((signup) => (
                              <TableRow key={signup.id}>
                                <TableCell className="px-5 py-3 text-gray-800 text-theme-sm dark:text-white/90">
                                  {ask.title}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-800 text-theme-sm dark:text-white/90">
                                  {signup.person?.full_name?.trim() || "—"}
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <CopyableEmail
                                    email={signup.person?.email ?? null}
                                    className="text-theme-sm"
                                  />
                                </TableCell>
                              </TableRow>
                            ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </ComponentCard>
        );
      })}
    </div>
  );
}

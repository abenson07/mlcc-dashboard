"use client";

import React from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { ArrowUpIcon } from "@/icons";
import type { FeatureItem } from "@/components/features/features-types";
import { getPriorityLabel } from "@/components/features/features-types";

const COOLDOWN_MS = 5000;

export interface FeaturesTableProps {
  features: FeatureItem[];
  selectedItem: FeatureItem | null;
  onRowClick: (item: FeatureItem) => void;
  onVote: (item: FeatureItem) => void;
  lastUpvoteAt: Record<string, number>;
  votingId: string | null;
}

function isOnCooldown(featureId: string, lastUpvoteAt: Record<string, number>): boolean {
  const t = lastUpvoteAt[featureId];
  if (!t) return false;
  return Date.now() - t < COOLDOWN_MS;
}

export default function FeaturesTable({
  features,
  selectedItem,
  onRowClick,
  onVote,
  lastUpvoteAt,
  votingId,
}: FeaturesTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[500px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Title
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 w-24"
                >
                  Priority
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 w-24"
                >
                  Votes
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 w-28"
                >
                  Upvote
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {features.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No features found.
                  </TableCell>
                </TableRow>
              ) : (
                features.map((feature) => {
                  const cooldown = isOnCooldown(feature.id, lastUpvoteAt);
                  const isSelected = selectedItem?.id === feature.id;
                  const isVoting = votingId === feature.id;

                  return (
                    <TableRow
                      key={feature.id}
                      onClick={() => onRowClick(feature)}
                      className={isSelected ? "bg-gray-50 dark:bg-white/[0.04]" : undefined}
                    >
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {feature.title}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center text-gray-700 text-theme-sm dark:text-gray-300">
                        {getPriorityLabel(feature.priority)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center text-gray-700 text-theme-sm dark:text-gray-300">
                        {feature.vote_count}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isVoting}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isVoting) return;
                            if (cooldown) {
                              toast.error("Please wait a few seconds before voting again.");
                              return;
                            }
                            onVote(feature);
                          }}
                          startIcon={<ArrowUpIcon className="size-4 shrink-0 fill-current" />}
                        >
                          Vote
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

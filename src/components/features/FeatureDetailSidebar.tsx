"use client";

import React from "react";
import type { FeatureItem } from "@/components/features/features-types";
import { getPriorityLabel } from "@/components/features/features-types";
import Label from "@/components/form/Label";

export interface FeatureDetailSidebarProps {
  item: FeatureItem;
  onClose?: () => void;
}

export default function FeatureDetailSidebar({ item }: FeatureDetailSidebarProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-theme-xs text-gray-500 dark:text-gray-400">
          Title
        </Label>
        <p className="mt-1 font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {item.title}
        </p>
      </div>

      {item.description && (
        <div>
          <Label className="text-theme-xs text-gray-500 dark:text-gray-400">
            Description
          </Label>
          <div className="mt-1 text-gray-700 text-theme-sm dark:text-gray-300 whitespace-pre-wrap">
            {item.description}
          </div>
        </div>
      )}

      {item.stateName && (
        <div>
          <Label className="text-theme-xs text-gray-500 dark:text-gray-400">
            State
          </Label>
          <p className="mt-1 text-gray-700 text-theme-sm dark:text-gray-300">
            {item.stateName}
          </p>
        </div>
      )}

      <div>
        <Label className="text-theme-xs text-gray-500 dark:text-gray-400">
          Priority
        </Label>
        <p className="mt-1 text-gray-700 text-theme-sm dark:text-gray-300">
          {getPriorityLabel(item.priority)}
        </p>
      </div>

      <div>
        <Label className="text-theme-xs text-gray-500 dark:text-gray-400">
          Votes
        </Label>
        <p className="mt-1 font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {item.vote_count}
        </p>
      </div>
    </div>
  );
}

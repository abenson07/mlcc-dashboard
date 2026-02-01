"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";

export const RefreshButton: React.FC = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setIsRefreshing(false);
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      title="Refresh data"
      aria-label="Refresh data"
      className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <Image
        src="/icons/refresh.svg"
        alt="Refresh data"
        width={20}
        height={20}
        className={isRefreshing ? "animate-spin" : ""}
      />
    </button>
  );
};

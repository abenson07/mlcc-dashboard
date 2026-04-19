"use client";
import React from "react";

export default function FiltersBar() {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
            <path d="M1 2h11M3 6h7M5 10h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          Filters
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Status ↑
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M3 4.5l2.5 2.5 2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Type
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M3 4.5l2.5 2.5 2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <button className="flex items-center gap-1.5 bg-transparent border-none text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 9l5 5 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Export all
      </button>
    </div>
  );
}

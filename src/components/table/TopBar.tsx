"use client";
import React from "react";

export default function TopBar() {
  return (
    <div className="flex items-center justify-between mb-7">
      <div className="flex items-center gap-2.5">
        <h1 className="text-[28px] font-light tracking-tight text-gray-900">Invoicing</h1>
        <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">
          Upgrade
        </span>
      </div>
      <div className="flex gap-2.5">
        <button className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Invoice settings
        </button>
        <button className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
          + Request money
        </button>
      </div>
    </div>
  );
}

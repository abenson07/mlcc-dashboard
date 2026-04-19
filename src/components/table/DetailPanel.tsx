"use client";
import React, { useEffect, useState } from "react";
import { Invoice } from "./types";
import StatusBadge from "./StatusBadge";

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

const metaFields = [
  { key: "dueDate",        label: "Due date" },
  { key: "invoiceDate",    label: "Invoice date" },
  { key: "invoiceNo",      label: "Invoice no." },
  { key: "autoReminders",  label: "Automated reminders" },
  { key: "recurring",      label: "Recurring" },
] as const;

export default function DetailPanel({ invoice, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  return (
    <div
      style={{
        width: 400,
        flexShrink: 0,
        transform: visible ? "translateX(0)" : "translateX(calc(100% + 40px))",
        opacity: visible ? 1 : 0,
        transition: "transform 240ms cubic-bezier(0.25,0.1,0.25,1), opacity 200ms ease",
      }}
      className="bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col self-start overflow-hidden z-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          Invoice to {invoice.customer}
        </span>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">
        <StatusBadge status={invoice.status} />

        {/* Amount */}
        <div className="mt-3 mb-5">
          <span className="text-4xl font-light tracking-tight text-gray-900">
            {invoice.amount}
          </span>
          <sup className="text-sm font-medium align-super leading-none">{invoice.cents}</sup>
        </div>

        {/* Timeline */}
        <div className="mb-6">
          {/* Sent step */}
          <div className="flex gap-3 mb-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-0.5 shrink-0" />
              <div className="w-px flex-1 bg-gray-200 min-h-8" />
            </div>
            <div>
              <div className="text-[13px] font-semibold mb-1">Sent to {invoice.customer}</div>
              <div className="text-xs text-gray-500 leading-relaxed">
                Sent to {invoice.sentTo} and{" "}
                <span className="text-blue-500 underline cursor-pointer">1 email</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1 uppercase tracking-wide">
                {invoice.createdDate} · Created by {invoice.createdBy}
              </div>
            </div>
          </div>

          {/* Payment step */}
          <div className="flex gap-3">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-300 mt-0.5 shrink-0" />
            <div>
              <div className="text-[13px] font-medium text-gray-500 mb-1">
                To {invoice.customer === "Breakout Studios" ? "Megan Payable" : invoice.customer}
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="1" y="3" width="10" height="7" rx="1.5" stroke="#9ca3af" strokeWidth="1.2" />
                  <path d="M4 3V2a2 2 0 014 0v1" stroke="#9ca3af" strokeWidth="1.2" />
                </svg>
                Using virtual account number
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="#9ca3af" strokeWidth="1.1" />
                  <path d="M6 5.5v3M6 4h.01" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-7">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3.5 border border-gray-200 rounded-md bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1a5.5 5.5 0 100 11A5.5 5.5 0 006.5 1zM6.5 3.5v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Remind
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3.5 border border-gray-200 rounded-md bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M9 2l2 2-7 7H2v-2l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            Edit
          </button>
          <button className="flex items-center justify-center gap-1 py-1.5 px-3.5 border border-gray-200 rounded-md bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            More
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M3 4.5l2.5 2.5 2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Metadata */}
        <div className="border-t border-gray-100">
          {metaFields.map(({ key, label }) => (
            <div
              key={key}
              className="flex justify-between items-center py-3.5 border-b border-gray-100"
            >
              <span className="text-[13px] text-gray-500">{label}</span>
              <span className="text-[13px] font-medium text-gray-900">{invoice[key]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

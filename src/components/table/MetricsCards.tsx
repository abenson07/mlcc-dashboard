"use client";
import React from "react";

const cards = [
  { label: "Total open", count: "6 Invoices", amount: "$5.4K", amountClass: "text-gray-900", info: true },
  { label: "Overdue",    count: "3 Invoices", amount: "$4.1K", amountClass: "text-orange-600", info: false },
  { label: "Paid",       count: "10 Invoices", amount: "$8.3K", amountClass: "text-gray-900", info: false },
];

export default function MetricsCards() {
  return (
    <div className="grid grid-cols-3 gap-4 mb-7">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-gray-300 transition-colors"
        >
          <div className={`text-[28px] font-light mb-1 ${card.amountClass}`}>{card.amount}</div>
          <div className="text-sm text-gray-700 flex items-center gap-1">
            {card.label}
            {card.info && (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5" stroke="#9ca3af" strokeWidth="1.1" />
                <path d="M6.5 5.5v3.5M6.5 4h.01" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{card.count}</div>
        </div>
      ))}
    </div>
  );
}

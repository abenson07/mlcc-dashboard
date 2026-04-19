"use client";
import React, { useState } from "react";
import { Invoice } from "./types";
import StatusBadge from "./StatusBadge";
import DetailPanel from "./DetailPanel";

interface Props {
  invoices: Invoice[];
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className="w-4 h-4 rounded-[3px] border-[1.5px] border-gray-300 shrink-0 flex items-center justify-center cursor-pointer transition-colors"
      style={{ background: checked ? "#111" : "#fff", borderColor: checked ? "#111" : undefined }}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

const thClass = "text-xs text-gray-500 font-medium px-3 py-2.5 text-left whitespace-nowrap select-none";

export default function DataTable({ invoices }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [allChecked, setAllChecked] = useState(false);

  const panelOpen = selectedId !== null;
  const selected = invoices.find((i) => i.id === selectedId) ?? null;

  const toggleRow = (id: number) => setSelectedId((prev) => (prev === id ? null : id));
  const toggleCheck = (id: number) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex gap-[10px] items-start">
      {/* Table */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className={`${thClass} w-10 pr-3 pl-1`}>
                <Checkbox
                  checked={allChecked}
                  onChange={() => setAllChecked((p) => !p)}
                />
              </th>
              <th className={thClass}>Due date</th>
              <th className={thClass}>
                <span className="flex items-center gap-1">
                  Status
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M5.5 2v7M2.5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </th>
              <th className={thClass}>Customer</th>
              <th className={`${thClass} text-right`}>Amount</th>
              {!panelOpen && (
                <>
                  <th className={thClass}>Invoice no.</th>
                  <th className={thClass}>Invoice date</th>
                  <th className={thClass}>Type</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const isSelected = selectedId === inv.id;
              return (
                <tr
                  key={inv.id}
                  onClick={() => toggleRow(inv.id)}
                  className="border-b border-gray-100 cursor-pointer transition-colors"
                  style={{ background: isSelected ? "#f0f4ff" : undefined }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#fafafa"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = ""; }}
                >
                  <td className="py-3.5 px-3 pl-1 w-10">
                    <Checkbox
                      checked={!!checked[inv.id] || allChecked}
                      onChange={() => toggleCheck(inv.id)}
                    />
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="text-[13px] font-medium text-gray-900">{inv.dueDate}</div>
                    {inv.dueRel && (
                      <div className="text-xs text-gray-400 mt-0.5">{inv.dueRel}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="text-[13px] font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                      {inv.customer}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                      {inv.email}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <span className="text-[13px] font-medium text-gray-900">
                      {inv.amount}
                      <sup className="text-[10px] font-semibold align-super leading-none">{inv.cents}</sup>
                    </span>
                  </td>
                  {!panelOpen && (
                    <>
                      <td className="py-3.5 px-3 text-[13px] text-gray-700">{inv.invoiceNo}</td>
                      <td className="py-3.5 px-3 text-[13px] text-gray-700">{inv.invoiceDate}</td>
                      <td className="py-3.5 px-3 text-[13px] text-gray-700">{inv.type}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selected && (
        <DetailPanel
          invoice={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

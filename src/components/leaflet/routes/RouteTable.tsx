"use client";

import type { ReactNode } from "react";

export type RouteTableColumn = {
  key: string;
  label: string;
  /** Px width for this column. Omit for the one column that should fill remaining space. */
  width?: number;
};

type RouteTableProps = {
  columns: RouteTableColumn[];
  children: ReactNode;
};

export default function RouteTable({ columns, children }: RouteTableProps) {
  return (
    <div className="lf-table-wrap">
      <table className="lf-table" style={{ tableLayout: "fixed" }}>
        <colgroup>
          {columns.map((c) => (
            <col key={c.key} style={c.width ? { width: c.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

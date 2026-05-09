import React, { KeyboardEventHandler, MouseEventHandler, ReactNode } from "react";

// Props for Table
interface TableProps {
  children: ReactNode; // Table content (thead, tbody, etc.)
  className?: string; // Optional className for styling
}

// Props for TableHeader
interface TableHeaderProps {
  children: ReactNode; // Header row(s)
  className?: string; // Optional className for styling
}

// Props for TableBody
interface TableBodyProps {
  children: ReactNode; // Body row(s)
  className?: string; // Optional className for styling
}

// Props for TableRow
interface TableRowProps {
  children: ReactNode; // Cells (th or td)
  className?: string; // Optional className for styling
  onClick?: () => void; // Optional click handler; when set, row is clickable
  tabIndex?: number;
  onKeyDown?: KeyboardEventHandler<HTMLTableRowElement>;
}

// Props for TableCell
interface TableCellProps {
  children: ReactNode; // Cell content
  isHeader?: boolean; // If true, renders as <th>, otherwise <td>
  className?: string; // Optional className for styling
  colSpan?: number; // Number of columns to span
  onClick?: MouseEventHandler<HTMLTableCellElement>;
}

// Table Component
const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`min-w-full  ${className ?? ""}`}>{children}</table>;
};

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

// TableRow Component
const TableRow: React.FC<TableRowProps> = ({ children, className, onClick, tabIndex, onKeyDown }) => {
  const isClickable = typeof onClick === "function";
  return (
    <tr
      className={`${className ?? ""} ${isClickable ? "cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04]" : ""}`.trim()}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
    >
      {children}
    </tr>
  );
};

// TableCell Component
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
  colSpan,
  onClick,
}) => {
  const CellTag = isHeader ? "th" : "td";
  return (
    <CellTag
      className={`bg-transparent ${className ?? ""}`}
      {...(colSpan !== undefined && { colSpan })}
      onClick={onClick}
    >
      {children}
    </CellTag>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableCell };

"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TableRowActionsMenu,
  type TableRowMenuItem,
} from "@/components/ui/table/TableRowActionsMenu";
import { useQrCodes } from "hooks";
import type { QrCodes } from "@/types/database";
import {
  copyQrPngToClipboard,
  downloadQrPng,
  generateQrPngDataUrl,
  qrDownloadFilename,
} from "@/lib/qr";
import { toast } from "sonner";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function QrPreview({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void generateQrPngDataUrl(url).then((dataUrl) => {
      if (!cancelled) setSrc(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!src) {
    return (
      <div
        className="h-16 w-16 shrink-0 rounded bg-gray-100 dark:bg-white/10"
        aria-hidden
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={64}
      height={64}
      className="h-16 w-16 shrink-0 rounded border border-gray-200 dark:border-white/10"
    />
  );
}

interface QrCodesTableProps {
  onEdit: (row: QrCodes) => void;
}

export default function QrCodesTable({ onEdit }: QrCodesTableProps) {
  const { qrCodes, loading, error, delete: deleteQrCode } = useQrCodes();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleCopy = async (row: QrCodes) => {
    setBusyId(row.id);
    try {
      await copyQrPngToClipboard(row.url);
      toast.success("QR PNG copied to clipboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to copy PNG");
    } finally {
      setBusyId(null);
    }
  };

  const handleDownload = async (row: QrCodes) => {
    setBusyId(row.id);
    try {
      await downloadQrPng(row.url, qrDownloadFilename(row));
      toast.success("Download started");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to download PNG");
    } finally {
      setBusyId(null);
    }
  };

  const handleCopyUrl = async (row: QrCodes) => {
    try {
      await navigator.clipboard.writeText(row.url);
      toast.success("URL copied");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleDelete = async (row: QrCodes) => {
    const label = row.name?.trim() || row.url;
    if (!window.confirm(`Delete QR code "${label}"?`)) return;
    setDeletingId(row.id);
    const ok = await deleteQrCode(row.id);
    if (ok) {
      toast.success("QR code deleted");
    } else {
      toast.error("Failed to delete QR code");
    }
    setDeletingId(null);
  };

  const rowMenuItems = (row: QrCodes): TableRowMenuItem[] => [
    {
      label: busyId === row.id ? "Copying…" : "Copy PNG",
      onClick: () => void handleCopy(row),
      disabled: busyId === row.id,
    },
    {
      label: busyId === row.id ? "Downloading…" : "Download PNG",
      onClick: () => void handleDownload(row),
      disabled: busyId === row.id,
    },
    { label: "Copy URL", onClick: () => void handleCopyUrl(row) },
    { label: "Edit", onClick: () => onEdit(row) },
    {
      label: deletingId === row.id ? "Deleting…" : "Delete",
      onClick: () => void handleDelete(row),
      disabled: deletingId === row.id,
      variant: "danger",
    },
  ];

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (qrCodes.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No QR codes yet. Create one to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell isHeader className="w-[72px]">
              Preview
            </TableCell>
            <TableCell isHeader>Name</TableCell>
            <TableCell isHeader>URL</TableCell>
            <TableCell isHeader>Created</TableCell>
            <TableCell isHeader className="text-right">
              Actions
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {qrCodes.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <QrPreview url={row.url} />
              </TableCell>
              <TableCell className="font-medium text-gray-800 dark:text-white/90">
                {row.name?.trim() || "—"}
              </TableCell>
              <TableCell className="max-w-xs">
                <a
                  href={row.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-500 hover:underline break-all"
                >
                  {row.url}
                </a>
              </TableCell>
              <TableCell className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatDate(row.created_at)}
              </TableCell>
              <TableCell>
                <TableRowActionsMenu items={rowMenuItems(row)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

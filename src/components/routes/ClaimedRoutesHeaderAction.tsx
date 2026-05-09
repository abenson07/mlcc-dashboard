"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import { useRoutes } from "hooks";

/** Button for Claimed Routes card header: reset is_skipped and clear secondary_deliverer on all claimed routes that have them */
export function ClaimedRoutesHeaderAction() {
  const { routes, update, refetch } = useRoutes({
    autoFetch: true,
    filters: { claimedOnly: true },
  });
  const [busy, setBusy] = useState(false);

  const needReset = routes.filter(
    (r) => r.is_skipped === true || (r.secondary_deliverer_id ?? null) != null,
  );

  const handleReset = async () => {
    if (needReset.length === 0) return;
    const count = needReset.length;
    if (
      !window.confirm(
        `Reset skipped status and remove secondary deliverer from ${count} route${count === 1 ? "" : "s"}?`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      for (const route of needReset) {
        await update(route.id, {
          is_skipped: false,
          secondary_deliverer_id: null,
        });
      }
      await refetch();
    } finally {
      setBusy(false);
    }
  };

  if (needReset.length === 0) return null;

  return (
    <Button variant="outline" size="sm" onClick={handleReset} disabled={busy}>
      {busy ? "Resetting…" : "Reset skipped & remove secondary"}
    </Button>
  );
}

"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { CopyableEmail } from "@/components/common/CopyableEmail";
import { Modal } from "@/components/ui/modal";
import { useRoutes, usePeople } from "hooks";
import type { RouteWithDeliverer } from "hooks";
import type { People } from "@/types/database";

function getDelivererDisplay(route: RouteWithDeliverer): {
  name: string;
  email: string | null;
} | null {
  const primary = route.primary_deliverer;
  const secondary = route.secondary_deliverer;
  if (primary) {
    return { name: primary.full_name, email: primary.email ?? null };
  }
  if (secondary) {
    return { name: secondary.full_name, email: secondary.email ?? null };
  }
  return null;
}

/** True if route has no primary and no secondary (truly open) */
function isTrulyOpen(route: RouteWithDeliverer): boolean {
  return !route.primary_deliverer_id && !route.secondary_deliverer_id;
}

/** True if route is skipped (has primary, is_skipped, no secondary) so we can add secondary */
function isSkippedClaimed(route: RouteWithDeliverer): boolean {
  return (
    route.is_skipped === true &&
    !!route.primary_deliverer_id &&
    !route.secondary_deliverer_id
  );
}

export default function OpenRoutesTable() {
  const { routes, loading, error, update } = useRoutes({
    autoFetch: true,
    filters: { openOnly: true },
  });
  const { people } = usePeople({ autoFetch: true });
  const [assigningRoute, setAssigningRoute] = useState<{
    route: RouteWithDeliverer;
    asSecondary: boolean;
  } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleAssignClick = (route: RouteWithDeliverer, asSecondary: boolean) => {
    setAssigningRoute({ route, asSecondary });
  };

  const handleSelectDeliverer = async (person: People) => {
    if (!assigningRoute) return;
    const { route, asSecondary } = assigningRoute;
    const message = asSecondary
      ? `Add ${person.full_name} as secondary deliverer for ${route.route_name}?`
      : `Assign ${person.full_name} to ${route.route_name}?`;
    if (!window.confirm(message)) return;
    setAssigningRoute(null);
    setUpdatingId(route.id);
    try {
      if (asSecondary) {
        await update(route.id, { secondary_deliverer_id: person.id });
      } else {
        await update(route.id, {
          primary_deliverer_id: person.id,
          primary_deliverer_email: person.email ?? null,
        });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400">Loading open routes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-xl border border-red-200 bg-white p-8 text-center dark:border-red-900/30 dark:bg-white/[0.03]">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[600px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Route
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Leaflet count
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Deliverer
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {routes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No open routes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  routes.map((route) => {
                    const deliverer = getDelivererDisplay(route);
                    const trulyOpen = isTrulyOpen(route);
                    const canAddSecondary = isSkippedClaimed(route);
                    const isRowBusy = updatingId === route.id;

                    return (
                      <TableRow key={route.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <div className="flex flex-col">
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {route.route_name}
                            </span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              {route.route_type ?? "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {route.leaflet_count ?? "—"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          {deliverer ? (
                            <div className="flex flex-col">
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {deliverer.name}
                              </span>
                              <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                <CopyableEmail email={deliverer.email} />
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-end">
                          <div className="flex items-center justify-end gap-2">
                            {trulyOpen && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAssignClick(route, false)}
                                disabled={isRowBusy}
                              >
                                Assign
                              </Button>
                            )}
                            {canAddSecondary && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAssignClick(route, true)}
                                disabled={isRowBusy}
                              >
                                Add secondary
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Deliverer picker modal */}
      <Modal
        isOpen={!!assigningRoute}
        onClose={() => setAssigningRoute(null)}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {assigningRoute?.asSecondary
            ? "Add secondary deliverer"
            : "Assign deliverer"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {assigningRoute?.route.route_name}
        </p>
        <ul className="max-h-64 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
          {people.map((person) => (
            <li key={person.id}>
              <button
                type="button"
                onClick={() => handleSelectDeliverer(person)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white text-sm"
              >
                <span className="font-medium">{person.full_name}</span>
                {person.email && (
                  <span className="block text-gray-500 dark:text-gray-400 text-xs">
                    {person.email}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCurrentPersonSnapshot,
  loadCurrentPerson,
  subscribeCurrentPerson,
  type CurrentPerson,
} from "@/lib/people/currentPerson";

export type { CurrentPerson };

/**
 * Resolves the logged-in dashboard user to their `people` row by email
 * (there's no auth_user_id column on `people`). Also exposes the auth
 * display name so the shell never falls back to a demo placeholder.
 *
 * Identity is cached for the session (module-level, not react-query) so
 * remounting the sidebar on each route does not re-hit Auth. Safe to call
 * from components that render outside a QueryClientProvider.
 */
export function useCurrentPerson() {
  const [, setTick] = useState(0);
  const snapshot = getCurrentPersonSnapshot();

  useEffect(() => {
    const unsubscribe = subscribeCurrentPerson(() => setTick((n) => n + 1));
    void loadCurrentPerson();
    return unsubscribe;
  }, []);

  const refetch = useCallback(async () => {
    await loadCurrentPerson({ force: true });
  }, []);

  return {
    person: snapshot.person,
    authDisplayName: snapshot.authDisplayName,
    authEmail: snapshot.authEmail,
    loading: snapshot.loading,
    refetch,
  };
}

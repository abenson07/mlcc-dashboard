"use client";

import { useCallback, useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { displayNameFromAuthUser } from "@/lib/auth/display-name";
import { findPersonByEmail } from "@/lib/people/findPersonByEmail";

export type CurrentPerson = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
};

/**
 * Resolves the logged-in dashboard user to their `people` row by email
 * (there's no auth_user_id column on `people`). Also exposes the auth
 * display name so the shell never falls back to a demo placeholder.
 * Plain state, not react-query, so it's safe to call from components that
 * render outside a QueryClientProvider.
 */
export function useCurrentPerson() {
  const [person, setPerson] = useState<CurrentPerson | null>(null);
  const [authDisplayName, setAuthDisplayName] = useState("");
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!supabaseClient) {
      setPerson(null);
      setAuthDisplayName("");
      setAuthEmail(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) {
      setPerson(null);
      setAuthDisplayName("");
      setAuthEmail(null);
      setLoading(false);
      return;
    }
    setAuthDisplayName(displayNameFromAuthUser(user).name);
    setAuthEmail(user.email ?? null);
    const { person: match } = await findPersonByEmail(supabaseClient, user.email);
    setPerson(match);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    void refetch();
  }, [refetch]);

  return { person, authDisplayName, authEmail, loading, refetch };
}

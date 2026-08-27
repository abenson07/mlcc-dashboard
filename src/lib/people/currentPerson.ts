import { supabaseClient } from "@/lib/supabaseClient";
import { displayNameFromAuthUser } from "@/lib/auth/display-name";
import { findPersonByEmail } from "./findPersonByEmail";

export type CurrentPerson = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
};

export type CurrentPersonSnapshot = {
  person: CurrentPerson | null;
  authDisplayName: string;
  authEmail: string | null;
  loading: boolean;
};

const emptySnapshot = (): CurrentPersonSnapshot => ({
  person: null,
  authDisplayName: "",
  authEmail: null,
  loading: false,
});

let snapshot: CurrentPersonSnapshot = {
  person: null,
  authDisplayName: "",
  authEmail: null,
  loading: true,
};
let hasResolved = false;
let inFlight: Promise<CurrentPersonSnapshot> | null = null;
const listeners = new Set<() => void>();
let authBound = false;

function emit() {
  for (const listener of listeners) listener();
}

function setSnapshot(next: CurrentPersonSnapshot) {
  snapshot = next;
  emit();
}

export function getCurrentPersonSnapshot(): CurrentPersonSnapshot {
  return snapshot;
}

export function subscribeCurrentPerson(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function bindAuthListener() {
  if (authBound || !supabaseClient) return;
  authBound = true;
  supabaseClient.auth.onAuthStateChange((event) => {
    if (event !== "SIGNED_OUT") return;
    inFlight = null;
    hasResolved = false;
    setSnapshot(emptySnapshot());
  });
}

async function fetchIdentity(): Promise<CurrentPersonSnapshot> {
  if (!supabaseClient) return emptySnapshot();

  try {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();

    if (error) {
      if (hasResolved) return { ...snapshot, loading: false };
      return emptySnapshot();
    }

    const user = session?.user ?? null;
    if (!user) {
      // Transient empty session (timeout) must not wipe a known identity.
      if (hasResolved && (snapshot.person || snapshot.authDisplayName || snapshot.authEmail)) {
        return { ...snapshot, loading: false };
      }
      return emptySnapshot();
    }

    const authDisplayName = displayNameFromAuthUser(user).name;
    const authEmail = user.email ?? null;
    const { person: match, error: peopleError } = await findPersonByEmail(
      supabaseClient,
      user.email,
    );

    return {
      person: match ?? (peopleError ? snapshot.person : null),
      authDisplayName,
      authEmail,
      loading: false,
    };
  } catch {
    if (hasResolved) return { ...snapshot, loading: false };
    return emptySnapshot();
  }
}

export async function loadCurrentPerson(options?: {
  force?: boolean;
}): Promise<CurrentPersonSnapshot> {
  bindAuthListener();

  const force = options?.force === true;
  if (!force && hasResolved) return snapshot;
  if (inFlight && !force) return inFlight;
  if (inFlight && force) await inFlight;

  if (force) {
    setSnapshot({ ...snapshot, loading: true });
  }

  const request = (async () => {
    const next = await fetchIdentity();
    hasResolved = true;
    setSnapshot(next);
    return next;
  })();

  inFlight = request.finally(() => {
    if (inFlight === request) inFlight = null;
  });

  return request;
}

/**
 * Resolves the logged-in dashboard user to a `people` row by matching email
 * (case-insensitive). There's no auth_user_id column on `people`, so email
 * is the only join key.
 *
 * Uses the session-scoped identity cache so callers do not hit Auth + `people`
 * on every invoke.
 */
export async function getCurrentPersonId(): Promise<string | null> {
  const { person } = await loadCurrentPerson();
  return person?.id ?? null;
}

/** Clears session cache. Used by tests. */
export function resetCurrentPersonCacheForTests() {
  inFlight = null;
  hasResolved = false;
  authBound = false;
  snapshot = {
    person: null,
    authDisplayName: "",
    authEmail: null,
    loading: true,
  };
}

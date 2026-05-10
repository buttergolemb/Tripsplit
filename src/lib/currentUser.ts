// Prototype-only "who am I" state. There's no real auth yet, so we persist a
// chosen member name in localStorage and expose a hook so any component can
// know which member the current user is acting as. When real auth arrives,
// this file is the one place to swap in a session lookup.

import React from "react";

const STORAGE_KEY = "tripsplit.currentUserName";
const DEFAULT_USER = "Sarah";

type Listener = (name: string) => void;
const listeners = new Set<Listener>();

function readStored(): string {
  if (typeof window === "undefined") return DEFAULT_USER;
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export function getCurrentUserName(): string {
  return readStored();
}

export function setCurrentUserName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    /* storage unavailable — best effort */
  }
  for (const l of listeners) l(name);
}

/**
 * Subscribe a component to the active user name. Returns a tuple so usage
 * mirrors useState: `const [name, setName] = useCurrentUser()`.
 */
export function useCurrentUser(): [string, (name: string) => void] {
  const [name, setName] = React.useState<string>(() => readStored());

  React.useEffect(() => {
    const listener: Listener = (next) => setName(next);
    listeners.add(listener);
    // Keep in sync across browser tabs.
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) setName(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return [name, setCurrentUserName];
}

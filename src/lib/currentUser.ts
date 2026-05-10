// Prototype "who am I" state locked to Sarah for demo consistency.
// This preserves the existing hook API shape so consuming components do not
// need to change, while disabling user impersonation controls.

import React from "react";

const FIXED_USER = "Sarah";

export function getCurrentUserName(): string {
  return FIXED_USER;
}

export function setCurrentUserName(_name: string): void {
  // Intentionally a no-op: demo runs as Sarah only.
}

/**
 * Subscribe a component to the active user name. Returns a tuple so usage
 * mirrors useState: `const [name, setName] = useCurrentUser()`.
 */
export function useCurrentUser(): [string, (name: string) => void] {
  const [name] = React.useState<string>(FIXED_USER);

  return [name, setCurrentUserName];
}

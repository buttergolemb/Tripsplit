// Small helpers shared by route handlers.

export function genId(prefix: string): string {
  // Short, URL-safe enough. Uses crypto for uniqueness.
  const rand = (globalThis.crypto ?? require("node:crypto") as Crypto)
    .getRandomValues(new Uint8Array(6));
  const hex = Array.from(rand).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}-${hex}`;
}

export function toCents(dollars: number | string): number {
  const n = typeof dollars === "string" ? parseFloat(dollars) : dollars;
  if (!Number.isFinite(n)) throw new Error("Invalid money value");
  return Math.round(n * 100);
}

export function toDollars(cents: number): number {
  return Math.round(cents) / 100;
}

// Postgres returns BOOLEAN columns as native booleans; we keep the helper
// name for backwards compatibility but accept any "truthy-or-not" shape
// so the call-sites in repo.ts don't need to be branch-aware.
export function boolFromInt(v: boolean | number | null | undefined): boolean {
  return !!v;
}

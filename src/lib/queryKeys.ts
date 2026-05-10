// Central place for TanStack Query cache keys so invalidations line up.
// Using a function-builder style lets us keep keys type-safe and consistent.

export const qk = {
  trips: () => ["trips"] as const,
  trip: (tripId: string) => ["trips", tripId] as const,
  balances: (tripId: string) => ["trips", tripId, "balances"] as const,
  expenses: (tripId: string) => ["trips", tripId, "expenses"] as const,
  timeline: (tripId: string) => ["trips", tripId, "timeline"] as const,
};

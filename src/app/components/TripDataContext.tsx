// This module creates a React context object at module-level.
// HMR would create a NEW context object on every edit, breaking the
// provider/consumer pairing between TripLayout and its children.
// Telling Vite to decline HMR here forces a full-page reload instead.
if (import.meta.hot) {
  import.meta.hot.decline();
}

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  tripsApi, membersApi, expensesApi, timelineApi,
  budgetApi, rulesApi, depositPolicyApi,
  type TripDTO, type ExpenseDTO, type DayScheduleDTO,
  type BudgetCategoryDTO, type TripRuleDTO, type DepositPolicyDTO,
} from "../../lib/api";
import { qk } from "../../lib/queryKeys";
import type { DaySchedule, Event, Suggestion } from "./timeline/types";
import { useToast } from "./ToastHost";

// ─── Public Types ────────────────────────────────────────────────────────────
// These shapes are what the rest of the app consumes via useTripData().
// We keep them stable so TripDashboard/Timeline/MoneyScreen/PlanningPhase/
// TripSettings keep working with no changes.

export type RSVPStatus = "committed" | "likely" | "interested" | "declined";
export type TripPhase = "planning" | "pre-trip" | "during" | "post-trip" | "complete";

export type Participant = {
  id: string;
  name: string;
  avatar: string;
  rsvp: RSVPStatus;
  depositPaid: boolean;
  role: string | null;
};

export type BudgetCategory = {
  id: string;
  name: string;
  estimate: number;
  actual: number;
  type: "shared" | "optional";
  icon: string;
};

export type TripRule = {
  id: string;
  title: string;
  items: string[];
  proposedBy: string;
  votes: number;
  totalVoters: number;
};

export type DepositPolicy = {
  amount: number;
  dueDate: string;
  covers: string[];
  dropoutRule: string;
  setBy: string;
};

// Expense shape consumed by UI. Backwards compatible with the previous
// prototype: `paidBy` and `splitWith[].name` remain names for display, but
// we also expose `paidById`/`splitWith[].memberId` for API mutations.
export type Expense = {
  id: string;
  description: string;
  category: string;
  emoji: string;
  amount: number;
  paidBy: string;                // member name (display)
  paidById: string;              // member id (mutations)
  date: string;
  confirmed: boolean;
  location?: string;
  splitWith: { name: string; memberId: string; share: number; paid: boolean }[];
};

export type TripData = {
  id: string;
  name: string;
  emoji: string;
  dates: string;
  destination: string;
  phase: TripPhase;
  depositPolicy: DepositPolicy | null;
  participants: Participant[];
  budgetCategories: BudgetCategory[];
  rules: TripRule[];
  timeline: DaySchedule[];
  expenses: Expense[];
};

// ─── Context Type ────────────────────────────────────────────────────────────

type TripContextType = {
  trip: TripData;
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
  // Participants
  addParticipant: (name: string, role?: string | null) => void;
  removeParticipant: (id: string) => void;
  updateRSVP: (id: string, status: RSVPStatus) => void;
  markDepositPaid: (id: string) => void;
  // Deposit policy (local-only — see notes at bottom of file)
  setDepositPolicy: (policy: DepositPolicy) => void;
  updateDepositPolicy: (updates: Partial<DepositPolicy>) => void;
  clearDepositPolicy: () => void;
  // Budget (local-only)
  addBudgetCategory: (cat: Omit<BudgetCategory, "id">) => void;
  updateBudgetEstimate: (id: string, estimate: number) => void;
  updateBudgetCategory: (id: string, updates: Partial<Omit<BudgetCategory, "id">>) => void;
  removeBudgetCategory: (id: string) => void;
  // Rules (local-only)
  addRule: (rule: Omit<TripRule, "id">) => void;
  voteOnRule: (id: string) => void;
  // Timeline
  addDay: (day: Omit<DaySchedule, "events" | "suggestions"> & { events?: Event[]; suggestions?: Suggestion[] }) => void;
  addEventToDay: (dayNumber: number, event: Event) => void;
  removeEventFromDay: (dayNumber: number, eventId: string) => void;
  updateEvent: (dayNumber: number, eventId: string, updates: Partial<Event>) => void;
  voteOnEvent: (eventId: string, type: "for" | "against") => void;
  // Expenses — payer may be identified by name (legacy) OR by id.
  addExpense: (expense: Omit<Expense, "id" | "paidById" | "splitWith"> & {
    paidById?: string;
    splitWith: { name: string; memberId?: string; share: number; paid?: boolean }[];
  }) => Promise<void> | void;
  toggleSplitPaid: (expenseId: string, memberId: string, paid: boolean) => void;
  confirmExpense: (expenseId: string) => void;
  removeExpense: (expenseId: string) => void;
  updateExpense: (expenseId: string, patch: Partial<{
    description: string;
    amount: number;
    category: string | null;
    emoji: string | null;
    date: string | null;
    location: string | null;
    confirmed: boolean;
  }>) => void;
  // Phase
  setPhase: (phase: TripPhase) => void;
  // Trip meta
  updateTrip: (updates: Partial<Pick<TripData, "name" | "emoji" | "dates" | "destination">>) => void;
};

const TripDataContext = React.createContext<TripContextType | null>(null);

export function useTripData() {
  const ctx = React.useContext(TripDataContext);
  if (!ctx) throw new Error("useTripData must be used within TripDataProvider");
  return ctx;
}

// ─── DTO → UI shape mappers ─────────────────────────────────────────────────

function mapAttendanceStatus(s: "going" | "maybe" | "declined"): "going" | "maybe" | "skipping" {
  return s === "declined" ? "skipping" : s;
}
function mapAttendanceStatusBack(s: "going" | "maybe" | "skipping"): "going" | "maybe" | "declined" {
  return s === "skipping" ? "declined" : s;
}

function dayFromDTO(d: DayScheduleDTO): DaySchedule {
  return {
    date: d.date ?? "",
    dayNumber: d.dayNumber,
    label: d.label ?? "",
    dayStartTime: d.dayStartTime ?? undefined,
    dayEndTime: d.dayEndTime ?? undefined,
    events: d.events.map((e) => ({
      id: e.id,
      title: e.title,
      time: e.time ?? "",
      endTime: e.endTime ?? undefined,
      location: e.location ?? undefined,
      emoji: e.emoji ?? "",
      state: e.state,
      votesFor: e.votesFor || undefined,
      votesAgainst: e.votesAgainst || undefined,
      votingCloses: e.votingCloses ?? undefined,
      attendees: e.attendees.map((a) => ({
        name: a.name,
        status: mapAttendanceStatus(a.status),
      })),
    })),
    suggestions: d.suggestions.map((s) => ({
      id: s.id,
      title: s.title,
      category: s.category ?? "",
      reason: s.reason ?? "",
      emoji: s.emoji ?? "",
      distance: s.distance ?? undefined,
      location: s.location ?? undefined,
      suggestedTime: s.suggestedTime ?? undefined,
    })),
  };
}

function expenseFromDTO(e: ExpenseDTO): Expense {
  return {
    id: e.id,
    description: e.description,
    category: e.category ?? "",
    emoji: e.emoji ?? "",
    amount: e.amount,
    paidBy: e.paidByName,
    paidById: e.paidBy,
    date: e.date ?? "",
    confirmed: e.confirmed,
    location: e.location ?? undefined,
    splitWith: e.splits.map((s) => ({
      name: s.name, memberId: s.memberId, share: s.share, paid: s.paid,
    })),
  };
}

function budgetFromDTO(c: BudgetCategoryDTO): BudgetCategory {
  return {
    id: c.id, name: c.name, estimate: c.estimate, actual: c.actual,
    type: c.type, icon: c.icon,
  };
}

function ruleFromDTO(r: TripRuleDTO): TripRule {
  return {
    id: r.id, title: r.title, items: r.items,
    proposedBy: r.proposedBy ?? "",
    votes: r.votes, totalVoters: r.totalVoters,
  };
}

function depositFromDTO(d: DepositPolicyDTO | null): DepositPolicy | null {
  if (!d) return null;
  return {
    amount: d.amount, dueDate: d.dueDate ?? "",
    covers: d.covers, dropoutRule: d.dropoutRule ?? "",
    setBy: d.setBy ?? "",
  };
}

function tripFromDTO(t: TripDTO): TripData {
  return {
    id: t.id,
    name: t.name,
    emoji: t.emoji ?? "",
    dates: t.dates ?? "",
    destination: t.destination ?? "",
    phase: t.phase,
    depositPolicy: depositFromDTO(t.depositPolicy),
    participants: t.members.map((m) => ({
      id: m.id, name: m.name, avatar: m.avatar ?? m.name[0] ?? "?",
      rsvp: m.rsvp, depositPaid: m.depositPaid, role: m.role,
    })),
    budgetCategories: (t.budgetCategories ?? []).map(budgetFromDTO),
    rules: (t.rules ?? []).map(ruleFromDTO),
    timeline: t.timeline.map(dayFromDTO),
    expenses: t.expenses.map(expenseFromDTO),
  };
}

// Empty fallback so consumers can render while fetching.
function emptyTrip(id: string): TripData {
  return {
    id, name: "", emoji: "✈️", dates: "", destination: "", phase: "planning",
    depositPolicy: null, participants: [], budgetCategories: [], rules: [],
    timeline: [], expenses: [],
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function TripDataProvider({ tripId, children }: { tripId: string; children: React.ReactNode }) {
  const qc = useQueryClient();
  const toast = useToast();

  // Small helper: most mutations share the same error-toast shape. Caller
  // passes a friendly verb ("save expense", "confirm expense", …) and we
  // surface the server error (if any) as the description.
  const toastError = React.useCallback((what: string, err: unknown) => {
    const message = err instanceof Error ? err.message : "Please try again.";
    toast.push({ tone: "error", title: `Couldn't ${what}`, description: message });
  }, [toast]);

  const tripQuery = useQuery({
    queryKey: qk.trip(tripId),
    queryFn: () => tripsApi.get(tripId),
  });

  const trip: TripData = React.useMemo(() => {
    return tripQuery.data ? tripFromDTO(tripQuery.data) : emptyTrip(tripId);
  }, [tripQuery.data, tripId]);

  // Keep a lookup of dayNumber → real dayId from the server so event mutations
  // target the right day regardless of whether the seed assigned a stable id
  // or a fresh day was just created via addDay.
  const dayIdByNumber = React.useMemo(() => {
    const m = new Map<number, string>();
    if (tripQuery.data) {
      for (const d of tripQuery.data.timeline) m.set(d.dayNumber, d.id);
    }
    return m;
  }, [tripQuery.data]);

  const invalidateTrip = React.useCallback(() => {
    qc.invalidateQueries({ queryKey: qk.trip(tripId) });
    qc.invalidateQueries({ queryKey: qk.balances(tripId) });
  }, [qc, tripId]);

  // ─── Mutations ────────────────────────────────────────────────────────

  const addParticipantMut = useMutation({
    mutationFn: (input: { name: string; role: string | null }) =>
      membersApi.add(tripId, { name: input.name, role: input.role }),
    onSuccess: invalidateTrip,
    onError: (err) => toastError("add member", err),
  });
  const updateMemberMut = useMutation({
    mutationFn: (input: { memberId: string; patch: Parameters<typeof membersApi.update>[2] }) =>
      membersApi.update(tripId, input.memberId, input.patch),
    onSuccess: invalidateTrip,
    onError: (err) => toastError("update member", err),
  });
  const removeMemberMut = useMutation({
    mutationFn: (memberId: string) => membersApi.remove(tripId, memberId),
    onSuccess: invalidateTrip,
    onError: (err) => toastError("remove member", err),
  });

  // Helper to patch the cached trip DTO in place for optimistic updates.
  const patchCachedTrip = React.useCallback((patcher: (draft: TripDTO) => TripDTO) => {
    qc.setQueryData<TripDTO>(qk.trip(tripId), (current) => current ? patcher(current) : current);
  }, [qc, tripId]);

  // Optimistic insert: create a local "pending" expense so the feed animates
  // in immediately. We also store the temp id so onSuccess can swap it out
  // for the server's real id without a flash of wrong state.
  const addExpenseMut = useMutation({
    mutationFn: (input: Parameters<typeof expensesApi.create>[1]) => expensesApi.create(tripId, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: qk.trip(tripId) });
      const previous = qc.getQueryData<TripDTO>(qk.trip(tripId));
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      // Denormalize names for the UI from the cached members list so the
      // optimistic row doesn't render with blank names.
      const membersById = new Map(
        (previous?.members ?? []).map((m) => [m.id, m.name])
      );
      const paidByName = membersById.get(input.paidBy) ?? "…";

      const tempExpense: ExpenseDTO = {
        id: tempId,
        tripId,
        description: input.description,
        category: input.category ?? null,
        emoji: input.emoji ?? null,
        amount: input.amount,
        paidBy: input.paidBy,
        paidByName,
        date: input.date ?? null,
        location: input.location ?? null,
        confirmed: input.confirmed ?? true,
        splits: input.splits.map((s) => ({
          memberId: s.memberId,
          name: membersById.get(s.memberId) ?? "…",
          share: s.share,
          paid: false,
        })),
      };

      patchCachedTrip((draft) => ({
        ...draft,
        expenses: [tempExpense, ...draft.expenses],
      }));
      return { previous, tempId };
    },
    onSuccess: (serverExpense, _vars, context) => {
      // Replace our temp placeholder with the real record server-side so the
      // list doesn't briefly duplicate while invalidate is in flight.
      if (context?.tempId) {
        patchCachedTrip((draft) => ({
          ...draft,
          expenses: draft.expenses.map((e) => e.id === context.tempId ? serverExpense : e),
        }));
      }
      toast.push({ tone: "success", title: "Expense added", description: serverExpense.description });
    },
    onError: (err, _vars, context) => {
      if (context?.previous) qc.setQueryData(qk.trip(tripId), context.previous);
      toastError("save expense", err);
    },
    onSettled: invalidateTrip,
  });

  // Pay toggle: update cache immediately so the checkmark, paid pill and
  // settle-progress bar animate on tap. Roll back on error.
  const setSplitPaidMut = useMutation({
    mutationFn: (input: { expenseId: string; memberId: string; paid: boolean }) =>
      expensesApi.setPaid(tripId, input.expenseId, input.memberId, input.paid),
    onMutate: async ({ expenseId, memberId, paid }) => {
      await qc.cancelQueries({ queryKey: qk.trip(tripId) });
      const previous = qc.getQueryData<TripDTO>(qk.trip(tripId));
      patchCachedTrip((draft) => ({
        ...draft,
        expenses: draft.expenses.map((e) => e.id !== expenseId ? e : ({
          ...e,
          splits: e.splits.map((s) => s.memberId === memberId ? { ...s, paid } : s),
        })),
      }));
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) qc.setQueryData(qk.trip(tripId), context.previous);
      toastError("update payment", err);
    },
    onSettled: invalidateTrip,
  });

  const updateExpenseMut = useMutation({
    mutationFn: (input: { expenseId: string; patch: Parameters<typeof expensesApi.update>[2] }) =>
      expensesApi.update(tripId, input.expenseId, input.patch),
    onMutate: async ({ expenseId, patch }) => {
      await qc.cancelQueries({ queryKey: qk.trip(tripId) });
      const previous = qc.getQueryData<TripDTO>(qk.trip(tripId));
      patchCachedTrip((draft) => ({
        ...draft,
        expenses: draft.expenses.map((e) => e.id === expenseId ? { ...e, ...patch } as typeof e : e),
      }));
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) qc.setQueryData(qk.trip(tripId), context.previous);
      toastError("update expense", err);
    },
    onSettled: invalidateTrip,
  });

  const removeExpenseMut = useMutation({
    mutationFn: (expenseId: string) => expensesApi.remove(tripId, expenseId),
    onMutate: async (expenseId) => {
      await qc.cancelQueries({ queryKey: qk.trip(tripId) });
      const previous = qc.getQueryData<TripDTO>(qk.trip(tripId));
      patchCachedTrip((draft) => ({
        ...draft,
        expenses: draft.expenses.filter((e) => e.id !== expenseId),
      }));
      return { previous };
    },
    onSuccess: () => toast.push({ tone: "success", title: "Expense deleted" }),
    onError: (err, _vars, context) => {
      if (context?.previous) qc.setQueryData(qk.trip(tripId), context.previous);
      toastError("delete expense", err);
    },
    onSettled: invalidateTrip,
  });

  const addDayMut = useMutation({
    mutationFn: (input: Parameters<typeof timelineApi.addDay>[1]) => timelineApi.addDay(tripId, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: qk.trip(tripId) });
      const previous = qc.getQueryData<TripDTO>(qk.trip(tripId));
      const tempDay: DayScheduleDTO = {
        id: input.id ?? `temp-day-${Date.now().toString(36)}`,
        dayNumber: input.dayNumber,
        date: input.date ?? null,
        label: input.label ?? null,
        dayStartTime: input.dayStartTime ?? null,
        dayEndTime: input.dayEndTime ?? null,
        events: [],
        suggestions: [],
      };
      patchCachedTrip((draft) => ({
        ...draft,
        timeline: [...draft.timeline, tempDay].sort((a, b) => a.dayNumber - b.dayNumber),
      }));
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) qc.setQueryData(qk.trip(tripId), context.previous);
      toastError("add day", err);
    },
  });
  const addEventMut = useMutation({
    mutationFn: (input: Parameters<typeof timelineApi.addEvent>[1]) => timelineApi.addEvent(tripId, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: qk.trip(tripId) });
      const previous = qc.getQueryData<TripDTO>(qk.trip(tripId));
      const tempEvent: TimelineEventDTO = {
        id: input.id ?? `temp-evt-${Date.now().toString(36)}`,
        dayId: input.dayId,
        title: input.title,
        time: input.time ?? null,
        endTime: input.endTime ?? null,
        location: input.location ?? null,
        emoji: input.emoji ?? null,
        state: input.state ?? "proposed",
        votesFor: 0,
        votesAgainst: 0,
        votingCloses: input.votingCloses ?? null,
        attendees: (input.attendees ?? []).map((a) => {
          const name =
            trip.participants.find((p) => p.id === a.memberId)?.name ?? "You";
          return { memberId: a.memberId, name, status: a.status ?? "going" };
        }),
      };
      patchCachedTrip((draft) => ({
        ...draft,
        timeline: draft.timeline.map((d) =>
          d.id === input.dayId ? { ...d, events: [...d.events, tempEvent] } : d
        ),
      }));
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) qc.setQueryData(qk.trip(tripId), context.previous);
      toastError("add event", err);
    },
  });
  const updateEventMut = useMutation({
    mutationFn: (input: { eventId: string; patch: Parameters<typeof timelineApi.updateEvent>[2] }) =>
      timelineApi.updateEvent(tripId, input.eventId, input.patch),
    onMutate: async ({ eventId, patch }) => {
      await qc.cancelQueries({ queryKey: qk.trip(tripId) });
      const previous = qc.getQueryData<TripDTO>(qk.trip(tripId));
      patchCachedTrip((draft) => ({
        ...draft,
        timeline: draft.timeline.map((d) => ({
          ...d,
          events: d.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  title: patch.title ?? e.title,
                  time: patch.time === undefined ? e.time : patch.time,
                  endTime: patch.endTime === undefined ? e.endTime : patch.endTime,
                  location: patch.location === undefined ? e.location : patch.location,
                  emoji: patch.emoji === undefined ? e.emoji : patch.emoji,
                  state: patch.state ?? e.state,
                  votingCloses:
                    patch.votingCloses === undefined ? e.votingCloses : patch.votingCloses,
                }
              : e
          ),
        })),
      }));
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) qc.setQueryData(qk.trip(tripId), context.previous);
      toastError("update event", err);
    },
  });
  const removeEventMut = useMutation({
    mutationFn: (eventId: string) => timelineApi.removeEvent(tripId, eventId),
    onMutate: async (eventId) => {
      await qc.cancelQueries({ queryKey: qk.trip(tripId) });
      const previous = qc.getQueryData<TripDTO>(qk.trip(tripId));
      patchCachedTrip((draft) => ({
        ...draft,
        timeline: draft.timeline.map((d) => ({
          ...d,
          events: d.events.filter((e) => e.id !== eventId),
        })),
      }));
      return { previous };
    },
    onSuccess: () => {
      toast.push({ tone: "success", title: "Event removed" });
    },
    onError: (err, _vars, context) => {
      if (context?.previous) qc.setQueryData(qk.trip(tripId), context.previous);
      toastError("remove event", err);
    },
  });
  const voteMut = useMutation({
    mutationFn: (input: { eventId: string; type: "for" | "against" }) =>
      timelineApi.vote(tripId, input.eventId, input.type),
    onMutate: async ({ eventId, type }) => {
      await qc.cancelQueries({ queryKey: qk.trip(tripId) });
      const previous = qc.getQueryData<TripDTO>(qk.trip(tripId));
      patchCachedTrip((draft) => ({
        ...draft,
        timeline: draft.timeline.map((d) => ({
          ...d,
          events: d.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  votesFor: (e.votesFor ?? 0) + (type === "for" ? 1 : 0),
                  votesAgainst: (e.votesAgainst ?? 0) + (type === "against" ? 1 : 0),
                }
              : e
          ),
        })),
      }));
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) qc.setQueryData(qk.trip(tripId), context.previous);
      toastError("record vote", err);
    },
  });
  const attendanceMut = useMutation({
    mutationFn: (input: { eventId: string; memberId: string; status: "going" | "maybe" | "declined" }) =>
      timelineApi.setAttendance(tripId, input.eventId, input.memberId, input.status),
    onMutate: async ({ eventId, memberId, status }) => {
      await qc.cancelQueries({ queryKey: qk.trip(tripId) });
      const previous = qc.getQueryData<TripDTO>(qk.trip(tripId));
      const memberName =
        trip.participants.find((p) => p.id === memberId)?.name ?? "You";
      patchCachedTrip((draft) => ({
        ...draft,
        timeline: draft.timeline.map((d) => ({
          ...d,
          events: d.events.map((e) => {
            if (e.id !== eventId) return e;
            const existing = e.attendees.find((a) => a.memberId === memberId);
            if (existing) {
              return {
                ...e,
                attendees: e.attendees.map((a) =>
                  a.memberId === memberId ? { ...a, status } : a
                ),
              };
            }
            return {
              ...e,
              attendees: [...e.attendees, { memberId, name: memberName, status }],
            };
          }),
        })),
      }));
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) qc.setQueryData(qk.trip(tripId), context.previous);
      toastError("update RSVP", err);
    },
  });

  const updateTripMut = useMutation({
    mutationFn: (patch: Parameters<typeof tripsApi.update>[1]) => tripsApi.update(tripId, patch),
    onSuccess: invalidateTrip,
    onError: (err) => toastError("update trip", err),
  });

  // Budget / rules / deposit policy — optimistic cache patches on top of the
  // trip payload so UI updates feel instant, same pattern as expenses.
  const addBudgetMut = useMutation({
    mutationFn: (input: Parameters<typeof budgetApi.add>[1]) => budgetApi.add(tripId, input),
    onSuccess: invalidateTrip,
    onError: (err) => toastError("add budget category", err),
  });
  const updateBudgetMut = useMutation({
    mutationFn: (input: { categoryId: string; patch: Parameters<typeof budgetApi.update>[2] }) =>
      budgetApi.update(tripId, input.categoryId, input.patch),
    onMutate: async ({ categoryId, patch }) => {
      await qc.cancelQueries({ queryKey: qk.trip(tripId) });
      const previous = qc.getQueryData<TripDTO>(qk.trip(tripId));
      patchCachedTrip((draft) => ({
        ...draft,
        budgetCategories: (draft.budgetCategories ?? []).map((c) =>
          c.id === categoryId ? { ...c, ...patch } as typeof c : c),
      }));
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) qc.setQueryData(qk.trip(tripId), context.previous);
      toastError("update budget", err);
    },
    onSettled: invalidateTrip,
  });
  const removeBudgetMut = useMutation({
    mutationFn: (categoryId: string) => budgetApi.remove(tripId, categoryId),
    onSuccess: invalidateTrip,
    onError: (err) => toastError("remove budget category", err),
  });

  const addRuleMut = useMutation({
    mutationFn: (input: Parameters<typeof rulesApi.add>[1]) => rulesApi.add(tripId, input),
    onSuccess: invalidateTrip,
    onError: (err) => toastError("add rule", err),
  });
  const voteRuleMut = useMutation({
    mutationFn: (ruleId: string) => rulesApi.vote(tripId, ruleId),
    onMutate: async (ruleId) => {
      await qc.cancelQueries({ queryKey: qk.trip(tripId) });
      const previous = qc.getQueryData<TripDTO>(qk.trip(tripId));
      patchCachedTrip((draft) => ({
        ...draft,
        rules: (draft.rules ?? []).map((r) =>
          r.id === ruleId ? { ...r, votes: Math.min(r.votes + 1, r.totalVoters || r.votes + 1) } : r),
      }));
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) qc.setQueryData(qk.trip(tripId), context.previous);
      toastError("record vote", err);
    },
    onSettled: invalidateTrip,
  });

  const setDepositMut = useMutation({
    mutationFn: (input: Parameters<typeof depositPolicyApi.upsert>[1]) =>
      depositPolicyApi.upsert(tripId, input),
    onSuccess: invalidateTrip,
    onError: (err) => toastError("set deposit policy", err),
  });
  const updateDepositMut = useMutation({
    mutationFn: (patch: Parameters<typeof depositPolicyApi.patch>[1]) =>
      depositPolicyApi.patch(tripId, patch),
    onSuccess: invalidateTrip,
    onError: (err) => toastError("update deposit policy", err),
  });
  const clearDepositMut = useMutation({
    mutationFn: () => depositPolicyApi.clear(tripId),
    onSuccess: invalidateTrip,
    onError: (err) => toastError("clear deposit policy", err),
  });

  // ─── Helper: resolve member name → id ─────────────────────────────────
  const memberByName = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const p of trip.participants) m.set(p.name, p.id);
    return m;
  }, [trip.participants]);

  const nameToId = React.useCallback((name: string | undefined | null) => {
    if (!name) return undefined;
    return memberByName.get(name);
  }, [memberByName]);

  // ─── Ctx ──────────────────────────────────────────────────────────────
  const ctx: TripContextType = React.useMemo(() => ({
    trip,
    isLoading: tripQuery.isLoading,
    error: tripQuery.error,
    refetch: () => tripQuery.refetch(),

    addParticipant: (name, role = null) => addParticipantMut.mutate({ name, role }),
    removeParticipant: (id) => removeMemberMut.mutate(id),
    updateRSVP: (id, status) => updateMemberMut.mutate({ memberId: id, patch: { rsvp: status } }),
    markDepositPaid: (id) => updateMemberMut.mutate({ memberId: id, patch: { depositPaid: true } }),

    setDepositPolicy: (policy) => setDepositMut.mutate({
      amount: policy.amount,
      dueDate: policy.dueDate || null,
      covers: policy.covers,
      dropoutRule: policy.dropoutRule || null,
      setBy: policy.setBy || null,
    }),
    updateDepositPolicy: (updates) => updateDepositMut.mutate({
      amount: updates.amount,
      dueDate: updates.dueDate ?? undefined,
      covers: updates.covers,
      dropoutRule: updates.dropoutRule ?? undefined,
      setBy: updates.setBy ?? undefined,
    }),
    clearDepositPolicy: () => clearDepositMut.mutate(),

    addBudgetCategory: (cat) => addBudgetMut.mutate({
      name: cat.name, estimate: cat.estimate, actual: cat.actual,
      type: cat.type, icon: cat.icon,
    }),
    updateBudgetEstimate: (id, estimate) =>
      updateBudgetMut.mutate({ categoryId: id, patch: { estimate } }),
    updateBudgetCategory: (id, updates) =>
      updateBudgetMut.mutate({ categoryId: id, patch: updates }),
    removeBudgetCategory: (id) => removeBudgetMut.mutate(id),

    addRule: (rule) => addRuleMut.mutate({
      title: rule.title, items: rule.items,
      proposedBy: rule.proposedBy || null,
      votes: rule.votes, totalVoters: rule.totalVoters,
    }),
    voteOnRule: (id) => voteRuleMut.mutate(id),

    addDay: (day) => addDayMut.mutate({
      dayNumber: day.dayNumber, date: day.date, label: day.label,
      dayStartTime: day.dayStartTime ?? null, dayEndTime: day.dayEndTime ?? null,
    }),

    addEventToDay: (dayNumber, event) => {
      const dayId = dayIdByNumber.get(dayNumber);
      if (!dayId) return;
      const attendees = (event.attendees ?? []).flatMap((a) => {
        const memberId = nameToId(a.name);
        return memberId ? [{
          memberId, status: mapAttendanceStatusBack(a.status),
        }] : [];
      });
      addEventMut.mutate({
        dayId, title: event.title, time: event.time ?? null,
        endTime: event.endTime ?? null, location: event.location ?? null,
        emoji: event.emoji ?? null, state: event.state,
        votingCloses: event.votingCloses ?? null,
        attendees,
      });
    },
    removeEventFromDay: (_dayNumber, eventId) => removeEventMut.mutate(eventId),
    updateEvent: (_dayNumber, eventId, updates) => updateEventMut.mutate({
      eventId,
      patch: {
        title: updates.title,
        time: updates.time ?? undefined,
        endTime: updates.endTime ?? undefined,
        location: updates.location ?? undefined,
        emoji: updates.emoji ?? undefined,
        state: updates.state,
        votingCloses: updates.votingCloses ?? undefined,
      },
    }),
    voteOnEvent: (eventId, type) => voteMut.mutate({ eventId, type }),

    addExpense: (input) => {
      const paidById = input.paidById ?? nameToId(input.paidBy);
      if (!paidById) {
        console.warn("addExpense: could not resolve paidBy", input.paidBy);
        return;
      }
      const splits = input.splitWith.flatMap((s) => {
        const memberId = s.memberId ?? nameToId(s.name);
        return memberId ? [{ memberId, share: s.share }] : [];
      });
      return addExpenseMut.mutateAsync({
        description: input.description,
        category: input.category || null,
        emoji: input.emoji || null,
        amount: input.amount,
        paidBy: paidById,
        date: input.date || null,
        location: input.location || null,
        confirmed: input.confirmed ?? true,
        splits,
      }).then(() => { /* keep return type void */ });
    },
    toggleSplitPaid: (expenseId, memberId, paid) =>
      setSplitPaidMut.mutate({ expenseId, memberId, paid }),
    confirmExpense: (expenseId) =>
      updateExpenseMut.mutate({ expenseId, patch: { confirmed: true } }),
    removeExpense: (expenseId) => removeExpenseMut.mutate(expenseId),
    updateExpense: (expenseId, patch) =>
      updateExpenseMut.mutate({ expenseId, patch }),

    setPhase: (phase) => updateTripMut.mutate({ phase }),
    updateTrip: (updates) => updateTripMut.mutate(updates),
    // Re-export setAttendance for completeness (unused today but handy).
    _setAttendance: (eventId: string, memberId: string, status: "going" | "maybe" | "declined") =>
      attendanceMut.mutate({ eventId, memberId, status }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  } as any), [
    trip, tripQuery.isLoading, tripQuery.error, nameToId, dayIdByNumber,
  ]);

  return (
    <TripDataContext.Provider value={ctx}>
      {children}
    </TripDataContext.Provider>
  );
}

// ─── Persistence notes ───────────────────────────────────────────────────────
//
// Every slice of TripData is now persisted via the Express API:
//   - participants / members     → /trips/:id/members
//   - expenses + splits          → /trips/:id/expenses (+ /splits/:memberId)
//   - timeline (days + events)   → /trips/:id/days, /trips/:id/events
//   - budget categories          → /trips/:id/budget
//   - rules                      → /trips/:id/rules (+ /vote)
//   - deposit policy             → /trips/:id/deposit-policy
//
// The TanStack Query cache is the source of truth for UI; mutations
// optimistically patch it and `onSettled` invalidates `qk.trip(tripId)` so
// the server's view wins eventually.
